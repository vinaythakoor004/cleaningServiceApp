package com.cleaning.cleaning_backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.cleaning.cleaning_backend.entity.Booking;

@Service
public class BookingNotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyNewBooking(Booking booking) { 
        String message = "New booking for " + booking.getFirstName() + booking.getLastName() +
                         " at " + this.getFormatedDate(booking.getBookingDetails().getBookingDateTime());
 
        messagingTemplate.convertAndSend("/topic/booking", message);
    }
    
    public void notifyUpdateBooking(Booking booking) {
        String message = "Updated booking for " + booking.getFirstName() + booking.getLastName() +
                         " at " + this.getFormatedDate(booking.getBookingDetails().getBookingDateTime());;

        messagingTemplate.convertAndSend("/topic/booking", message);
    }
    
    private String getFormatedDate(LocalDateTime localDateTime) {
    	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a", Locale.US);

        String formattedDateTime = localDateTime.format(formatter);    
        System.out.println(formattedDateTime);
    	return formattedDateTime;
    }
    
    
}