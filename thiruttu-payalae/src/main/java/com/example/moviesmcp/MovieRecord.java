package com.example.moviesmcp;

public record MovieRecord(
	String title,
	String url,
	Integer year,
	int page,
	String imageUrl,
	Double rating
) {
}
