package com.devsecops.orders.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String username;
    private final String email;
    private final String role;
    private final boolean isAdmin;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long userId, String username, String email, String role, boolean isAdmin,
                         Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.isAdmin = isAdmin;
        this.authorities = authorities;
    }

    public static UserPrincipal create(Long userId, String username, String email, String role, boolean isAdmin) {
        List<SimpleGrantedAuthority> authorities;
        if (isAdmin || "admin".equalsIgnoreCase(role)) {
            authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_USER")
            );
        } else {
            authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return new UserPrincipal(userId, username, email, role, isAdmin, authorities);
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
