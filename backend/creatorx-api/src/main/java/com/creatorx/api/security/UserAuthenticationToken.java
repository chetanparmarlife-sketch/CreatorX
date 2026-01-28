package com.creatorx.api.security;

import com.creatorx.repository.entity.User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * Custom authentication token that keeps User as the principal
 * but overrides getName() to return the user ID instead of User.toString().
 *
 * This ensures:
 * - authentication.getName()        → returns user.getId() (correct for all controllers)
 * - authentication.getPrincipal()   → returns User entity (backward compatible)
 */
public class UserAuthenticationToken extends UsernamePasswordAuthenticationToken {

    public UserAuthenticationToken(User user, Collection<? extends GrantedAuthority> authorities) {
        super(user, null, authorities);
    }

    @Override
    public String getName() {
        Object principal = getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        return super.getName();
    }
}
