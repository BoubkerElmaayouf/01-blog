package com.cocoon._blog.service;

import com.cocoon._blog.dto.FollowResponse;
import com.cocoon._blog.entity.Followers;
import com.cocoon._blog.entity.FollowersId;
import com.cocoon._blog.entity.NotificationType;
import com.cocoon._blog.repository.FollowersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowersRepository followersRepository;
    private final NotificationService notificationService;


    public FollowResponse follow(Long followerId, Long followingId) {
        FollowersId id = new FollowersId(followerId, followingId);

        if (followersRepository.existsById(id)) {
            return makeResponse(followerId, followingId, false, "Already following");
        }

        Followers follower = Followers.builder()
                .id(id)
                .followedAt(LocalDateTime.now())
                .build();
        followersRepository.save(follower);

        notificationService.createNotification(followerId, followingId, NotificationType.PROFILE, null);


        return makeResponse(followerId, followingId, true, "Followed successfully");
    }

    public FollowResponse unfollow(Long followerId, Long followingId) {
        FollowersId id = new FollowersId(followerId, followingId);

        if (!followersRepository.existsById(id)) {
            return makeResponse(followerId, followingId, false, "Not following");
        }

        followersRepository.deleteById(id);
        return makeResponse(followerId, followingId, true, "Unfollowed successfully");
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return followersRepository.existsById(new FollowersId(followerId, followingId));
    }

    private FollowResponse makeResponse(Long fId, Long gId, boolean success, String msg) {
        FollowResponse res = new FollowResponse();
        res.setFollowerId(fId);
        res.setFollowingId(gId);
        res.setSuccess(success);
        res.setMessage(msg);
        return res;
    }

    public List<Long> getFollowers(Long userId) {
    // Find all followers where the user is being followed
    return followersRepository.findByIdFollowingId(userId) // returns List<Followers>
            .stream()
            .map(f -> f.getId().getFollowerId()) // extract follower IDs
            .collect(Collectors.toList());

    }
}

