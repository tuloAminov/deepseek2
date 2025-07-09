package com.AA.deepseek.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

//    @GetMapping("/api/deepseek/")
//    public String index() {
//        return "index";
//    }

    @GetMapping("/")
    public String main() {
        return "deepseek";
    }
}