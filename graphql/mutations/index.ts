import { gql } from '@apollo/client'

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      confirmationCode
      totalPrice
      currency
      checkIn
      checkOut
      hotel {
        name
        location
      }
      room {
        name
      }
    }
  }
`

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      id
      status
    }
  }
`

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      avatar
    }
  }
`

export const CREATE_HOTEL = gql`
  mutation CreateHotel($input: CreateHotelInput!) {
    createHotel(input: $input) {
      id
      name
      location
    }
  }
`

export const CREATE_ROOM = gql`
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
      id
      name
      price
    }
  }
`

export const UPDATE_ROOM_AVAILABILITY = gql`
  mutation UpdateRoomAvailability($id: ID!, $available: Boolean!) {
    updateRoomAvailability(id: $id, available: $available) {
      id
      available
    }
  }
`
