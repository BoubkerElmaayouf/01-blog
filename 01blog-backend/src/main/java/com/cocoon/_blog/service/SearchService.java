package com.cocoon._blog.service;

import com.cocoon._blog.dto.SearchUserPostResponse;
import com.cocoon._blog.repository.SearchPostUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

      private final SearchPostUserRepository searchPostUserRepository;

    public List<SearchUserPostResponse> search(String query) {
        return searchPostUserRepository.searchPostsAndUsers(query);
    }
}
