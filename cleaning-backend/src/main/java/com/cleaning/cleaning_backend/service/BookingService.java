package com.cleaning.cleaning_backend.service;

import com.cleaning.cleaning_backend.dto.BookingListResponse;
import com.cleaning.cleaning_backend.entity.Booking;
import com.cleaning.cleaning_backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class BookingService {

	private final BookingRepository bookingRepository;

	@Autowired
	public BookingService(BookingRepository bookingRepository) {
		this.bookingRepository = bookingRepository;
	}

	// Save a single booking
	public Booking saveBooking(Booking booking) {
		return bookingRepository.save(booking);
	}

	// Get all bookings
	public BookingListResponse getAllBookings(int page, int pageSize, String search) {
		int safePage = Math.max(page - 1, 0);
		Pageable pageable = PageRequest.of(safePage, pageSize, Sort.by("id").descending());

		Page<Booking> bookingPage;

		if (search == null || search.isBlank()) {
			bookingPage = bookingRepository.findAll(pageable);
		} else {
			bookingPage = bookingRepository.searchBookings(search, pageable);
		}
		long count = bookingPage.getTotalElements();

		return new BookingListResponse(bookingPage.getContent(), count);
	}

	public Booking updateBooking(Long id, Booking updatedBooking) {
		return bookingRepository.findById(id).map(existingBooking -> {

			// Option 1: Manually update fields
			existingBooking.setFirstName(updatedBooking.getFirstName());
			existingBooking.setLastName(updatedBooking.getLastName());
			existingBooking.setEmail(updatedBooking.getEmail());
			existingBooking.setPhone(updatedBooking.getPhone());
			existingBooking.setMessage(updatedBooking.getMessage());
			existingBooking.setCountry(updatedBooking.getCountry());
			existingBooking.setBookingDetails(updatedBooking.getBookingDetails());

			return bookingRepository.save(existingBooking);
		}).orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
	}

	public void deleteBooking(Long id) {
		if (!bookingRepository.existsById(id)) {
			throw new RuntimeException("Booking not found with id: " + id);
		}
		bookingRepository.deleteById(id);
	}

	// Find booking by ID
	public Optional<Booking> getBookingById(Long id) {
		return bookingRepository.findById(id);
	}

}
