package com.creatorx.service;

import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    @Cacheable(value = "user_profile", key = "#id")
    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
    
    @Transactional(readOnly = true)
    public User findBySupabaseId(String supabaseId) {
        return userRepository.findBySupabaseId(supabaseId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "supabaseId: " + supabaseId));
    }
    
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email: " + email));
    }
    
    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }
    
    @Transactional
    public User createOrUpdateFromSupabase(String supabaseId, String email, String name) {
        return userRepository.findBySupabaseId(supabaseId)
                .map(user -> {
                    user.setEmail(email);
                    user.setName(name);
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .supabaseId(supabaseId)
                            .email(email)
                            .name(name)
                            .build();
                    return userRepository.save(newUser);
                });
    }
}




