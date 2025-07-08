package com.AA.deepseek;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan("com.AA.deepseek")
public class DeepseekApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeepseekApplication.class, args);
	}

}
