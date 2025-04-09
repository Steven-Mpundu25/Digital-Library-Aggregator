package com.unza.dla.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/home")
    public String home(Model model) {
        // Replace "John Doe" with the username of the logged-in user.
        String username = "John Doe"; // This will be dynamic in a real application.
        model.addAttribute("username", username);
        return "home";
    }
}