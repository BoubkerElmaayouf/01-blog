package com.cocoon._blog.service;

import com.cocoon._blog.dto.FollowResponse;
import com.cocoon._blog.entity.Followers;
import com.cocoon._blog.entity.FollowersId;
import com.cocoon._blog.entity.NotificationType;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.FollowersRepository;
import com.cocoon._blog.repository.UserRepository;
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
    private final UserRepository userRepository;

    // 🔹 Follow user
    public FollowResponse follow(Long followerId, Long followingId) {
        User followerUser = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower user not found"));
        User followingUser = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("Following user not found"));

        // 🚫 Prevent banned users from following
        if (followerUser.getBanned()) {
            throw new RuntimeException("Your account has been banned. You cannot perform this action.");
        }

        FollowersId id = new FollowersId(followerId, followingId);

        if (followersRepository.existsById(id)) {
            return makeResponse(followerId, followingId, false, "Already following");
        }

        Followers follower = Followers.builder()
                .id(id)
                .followedAt(LocalDateTime.now())
                .build();
        followersRepository.save(follower);

        notificationService.createNotification(
                followerId,
                followingId,
                NotificationType.PROFILE,
                null,
                null,
                "started following you 🎉"
        );

        return makeResponse(followerId, followingId, true, "Followed successfully");
    }

    // 🔹 Unfollow user
    public FollowResponse unfollow(Long followerId, Long followingId) {
        User followerUser = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower user not found"));

        // 🚫 Prevent banned users from unfollowing
        if (followerUser.getBanned()) {
            throw new RuntimeException("Your account has been banned. You cannot perform this action.");
        }

        FollowersId id = new FollowersId(followerId, followingId);

        if (!followersRepository.existsById(id)) {
            return makeResponse(followerId, followingId, false, "Not following");
        }

        followersRepository.deleteById(id);
        return makeResponse(followerId, followingId, true, "Unfollowed successfully");
    }

    // 🔹 Check if user follows another
    public boolean isFollowing(Long followerId, Long followingId) {
        return followersRepository.existsById(new FollowersId(followerId, followingId));
    }

    // 🔹 Helper to build response
    private FollowResponse makeResponse(Long fId, Long gId, boolean success, String msg) {
        FollowResponse res = new FollowResponse();
        res.setFollowerId(fId);
        res.setFollowingId(gId);
        res.setSuccess(success);
        res.setMessage(msg);
        return res;
    }

    // 🔹 Get followers of a user
    public List<Long> getFollowers(Long userId) {
        return followersRepository.findByIdFollowingId(userId)
                .stream()
                .map(f -> f.getId().getFollowerId())
                .collect(Collectors.toList());
    }
}
