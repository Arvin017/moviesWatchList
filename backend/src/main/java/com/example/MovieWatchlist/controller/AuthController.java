package com.example.MovieWatchlist.controller;

import com.example.MovieWatchlist.dto.LoginRequest;
import com.example.MovieWatchlist.dto.RegisterRequest;
import com.example.MovieWatchlist.entity.User;
import com.example.MovieWatchlist.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://movies-watch-list-nckm.vercel.app"
})
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}