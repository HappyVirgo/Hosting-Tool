import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import SelectMessageTemplates from "../admin/components/SelectMessageTemplates";

const setup = (bindings) => {
  const props = {
    onSelectedTemplate: jest.fn(),
    messageRules: [{}],
    selectedValue: "",
    ...bindings,
  }

  const view = render(<SelectMessageTemplates {...props} />);

  return {
    view,
    props,
  };
};


describe('Message Rules', () => {

    test("should add more templates from message rules", () => {
        const { view } = setup({
            messageRules: [{
                title: "Message Rule 1",
                event: "booking",
                type: "msg1",
                _id: "msg1",
            }, {
                title: "Message Rule 2",
                event: "booking",
                type: "msg2",
                _id: "msg2",
            }]
        });
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});

        expect(queryByText("Message Rule 1")).toBeInTheDocument();
        expect(queryByText("Message Rule 2")).toBeInTheDocument();
    });

    test("should select new template from message rules", async () => {
        const {view, props} = setup({
            messageRules: [{
                title: "Message Rule 1",
                event: "booking",
                type: "msg1",
                _id: "msg1",
            }, {
                title: "Message Rule 2",
                event: "booking",
                type: "msg2",
                _id: "msg2",
            }]
        });
        const {container} = view;
        const {queryByText} = screen;

        fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
        await waitFor(() => queryByText("Message Rule 1"));
        fireEvent.click(queryByText("Message Rule 1"));

        expect(queryByText("Message Rule 1")).toBeInTheDocument();
        expect(props.onSelectedTemplate).toHaveBeenCalledWith({
            title: "Message Rule 1",
            event: "booking",
            type: "msg1",
        });
    });
});

describe("onSelectedTemplate", () => {

  test("should call correct params when select `booking`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Booking Confirmation Message Template"));
    fireEvent.click(queryByText("Booking Confirmation Message Template"));

    expect(queryByText("Booking Confirmation Message Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
      title: "Booking Confirmation Rule",
      message:
          "Hi {{Guest First Name}},\n\n" +
          "Thanks for booking our place.  I'll send you more details including check-in instructions soon but " +
          "in the meantime, if you have any questions please don't hesitate to ask.",
      event: "booking",
      lastMinuteMessageEnabled: false,
      lastMinuteMessageIsTheSame: false,
      lastMinuteMessage: "",
      reviewEnabled: false,
      reviewMessage: "",
      sendMessageAfterLeavingReview: false,
      disableMessageAfterReview: false,
      emailEnabled: false,
      email: "",
      smsEnabled: false,
      sms: "",
      delay: 10,
      preapprove: false,
      languagesEnabled: false
    });
  });

  test("should call correct params when select `inquiry`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Booking Inquiry Message Template"));
    fireEvent.click(queryByText("Booking Inquiry Message Template"));

    expect(queryByText("Booking Inquiry Message Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
      title: "Inquiry Response Rule",
      message:
          "Hi {{Guest First Name}},\n\n" +
          "Thanks for your inquiry, I wanted to let you know that I got your message and will respond right away.",
      event: "inquiry",
      lastMinuteMessageEnabled: false,
      lastMinuteMessageIsTheSame: false,
      lastMinuteMessage: "",
      reviewEnabled: false,
      reviewMessage: "",
      sendMessageAfterLeavingReview: false,
      disableMessageAfterReview: false,
      emailEnabled: false,
      email: "",
      smsEnabled: false,
      sms: "",
      delay: 10,
      preapprove: false,
      languagesEnabled: false
    });
  });

  test("should call correct params when select `timedout`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Pre-approval Expired Message Template"));
    fireEvent.click(queryByText("Pre-approval Expired Message Template"));

    expect(queryByText("Pre-approval Expired Message Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
      title: "Booking Pre-approval Expired Rule",
      message:
          "Hi {{Guest First Name}},\n\n" +
          "I saw that your pre-approval expired and wanted to let you know that we would be happy to host you if you decide to book.  Feel free to send me a message if you have any question.",
      event: "timedout",
      lastMinuteMessageEnabled: false,
      lastMinuteMessageIsTheSame: false,
      lastMinuteMessage: "",
      reviewEnabled: false,
      reviewMessage: "",
      sendMessageAfterLeavingReview: false,
      disableMessageAfterReview: false,
      emailEnabled: false,
      email: "",
      smsEnabled: false,
      sms: "",
      delay: 10,
      preapprove: false,
      languagesEnabled: false
    });
  });

  test("should call correct params when select `pending`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Booking Request Message Template"));
    fireEvent.click(queryByText("Booking Request Message Template"));

    expect(queryByText("Booking Request Message Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        title: "Booking Request Response Rule",
        message:
            "Hi {{Guest First Name}},\n\n" +
            "Thanks for booking request, I wanted to let you know that I received your message and I will respond right away.",
        event: "pending",
        lastMinuteMessageEnabled: false,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage: "",
        reviewEnabled: false,
        reviewMessage: "",
        sendMessageAfterLeavingReview: false,
        disableMessageAfterReview: false,
        emailEnabled: false,
        email: "",
        smsEnabled: false,
        sms: "",
        delay: 10,
        preapprove: false,
        languagesEnabled: false
    });
  });

  test("should call correct params when select `checkin`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Check-In Message Template"));
    fireEvent.click(queryByText("Check-In Message Template"));

    expect(queryByText("Check-In Message Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        template: "checkin",
        title: "Check-In Rule",
        time: 17,
        days: -2,
        event: "checkin",
        reservationLength: 1,
        message:
            "Hi {{Guest First Name}},\n\n" +
            "Just wanted to touch base and give you some more information about your stay.  You are welcome " +
            "to check-in anytime after {{Check-In Time}} {{Check-In Date}}.  Your checkout time " +
            "is {{Check-Out Time}} {{Check-Out Date}}.\n\n" +
            "LOCATION:\n" +
            "1234 Main St, City, State Zip\n\n" +
            "KEY:\n" +
            "The key will be in a small lock box (aka. key safe) near the front door. The code " +
            "is 1234.  Please don't forget to return the key to the lock box when you leave :)\n\n" +
            "PARKING:\n" +
            "You're welcome to park in the drive way and there is also always plenty of free street parking.\n\n" +
            "WIFI:\n" +
            "The wifi network is 'WIFI_NETWORK_NAME' and the password is 'WIFI_PASSWORD'.\n\n" +
            "More information about the apartment and neighborhood can be found in the 'House Manual' on airbnb.com.\n\n" +
            "Please let us know if you have any questions and I hope you enjoy your stay.",
        lastMinuteMessageEnabled: true,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage:
            "Hi {{Guest First Name}},\n\n" +
            "Thanks for booking our place.  You are welcome " +
            "to check-in anytime after {{Check-In Time}} {{Check-In Date}}.  Your checkout time " +
            "is {{Check-Out Time}} {{Check-Out Date}}.\n\n" +
            "LOCATION:\n" +
            "1234 Main St, City, State Zip\n\n" +
            "KEY:\n" +
            "The key will be in a small lock box (aka. key safe) near the front door. The code " +
            "is 1234.  Please don't forget to return the key to the lock box when you leave :)\n\n" +
            "PARKING:\n" +
            "You're welcome to park in the drive way and there is also always plenty of free street parking.\n\n" +
            "WIFI:\n" +
            "The wifi network is 'WIFI_NETWORK_NAME' and the password is 'WIFI_PASSWORD'.\n\n" +
            "More information about the apartment and neighborhood can be found in the 'House Manual' on airbnb.com.\n\n" +
            "Please let us know if you have any questions and I hope you enjoy your stay.",
        reviewEnabled: false,
        reviewMessage: "",
        sendMessageAfterLeavingReview: false,
        disableMessageAfterReview: false,
        emailEnabled: false,
        email: "",
        smsEnabled: false,
        sms: "",
        delay: 0,
        preapprove: false,
        languagesEnabled: false
    });
  });

  test("should call correct params when select `checkup`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Check-Up Message Template"));
    fireEvent.click(queryByText("Check-Up Message Template"));

    expect(queryByText("Check-Up Message Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        template: "checkup",
        title: "Check-Up Rule",
        time: 10,
        days: 1,
        event: "checkin",
        reservationLength: 2,
        message:
            "Hi {{Guest First Name}},\n\n" +
            "Just wanted to check in and make sure you have everything you need?\n\n" +
            "Hope you're enjoying your stay!",
        lastMinuteMessageEnabled: false,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage: "",
        reviewEnabled: false,
        reviewMessage: "",
        sendMessageAfterLeavingReview: false,
        disableMessageAfterReview: false,
        emailEnabled: false,
        email: "",
        smsEnabled: false,
        sms: "",
        delay: 0,
        preapprove: false,
        languagesEnabled: false
    });
  });

  test("should call correct params when select `checkout`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Check-Out Message Template"));
    fireEvent.click(queryByText("Check-Out Message Template"));

    expect(queryByText("Check-Out Message Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        template: "checkout",
        title: "Check-Out Rule",
        time: 17,
        days: -1,
        event: "checkout",
        reservationLength: 2,
        message:
            "Hi {{Guest First Name}},\n\n" +
            "Just a reminder that your check-out is tomorrow at {{Check-Out Time}}.  " +
            "When you are ready to leave, please lock the door and put the keys back in the lock box.  " +
            "Once you have left, would you please message me so I can let the cleaners know?\n\n" +
            "Hope you had a great time.\n\n" +
            "Happy travels!",
        lastMinuteMessageEnabled: false,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage: "",
        reviewEnabled: false,
        reviewMessage: "",
        sendMessageAfterLeavingReview: false,
        disableMessageAfterReview: false,
        emailEnabled: false,
        email: "",
        smsEnabled: false,
        sms: "",
        delay: 0,
        preapprove: false,
        languagesEnabled: false
    });
  });

  test("should call correct params when select `takeOutTheTrash`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Take Out The Trash"));
    fireEvent.click(queryByText("Take Out The Trash"));

    expect(queryByText("Take Out The Trash")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        template: "takeOutTheTrash",
        title: "Please Take Out the Trash",
        time: 18,
        days: -1,
        event: "occupied",
        dayOfTheWeek: "thursday",
        reservationLength: 1,
        message:
            "Hi {{Guest First Name}},\n\n" +
            "Could you do me a favor?  The trash gets picked up every Friday morning, would you " +
            "mind rolling the bin out to the curb tonight?\n\n" +
            "Thanks!",
        lastMinuteMessageEnabled: false,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage: "",
        reviewEnabled: false,
        reviewMessage: "",
        sendMessageAfterLeavingReview: false,
        disableMessageAfterReview: false,
        emailEnabled: false,
        email: "",
        smsEnabled: false,
        sms: "",
        delay: 0,
        preapprove: false,
        languagesEnabled: false
    });
  });

  test("should call correct params when select `review`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Review Guest Template"));
    fireEvent.click(queryByText("Review Guest Template"));

    expect(queryByText("Review Guest Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        template: "review",
        title: "Review Guest Rule",
        time: 16,
        days: 1,
        event: "checkout",
        reservationLength: 1,
        message:
            "Hi {{Guest First Name}},\n\n" +
            "Thanks for being such a great guest and leaving the place so clean.  " +
            "We left you a 5 star review and if you enjoyed your stay it would be great if you left us a review as well.  " +
            "If there is anything that could have made your stay better please send us a message." +
            "Thanks again for booking our place.\n\n" +
            "Hope to see you next time you're in town!",
        lastMinuteMessageEnabled: false,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage: "",
        reviewEnabled: true,
        reviewMessage:
            "What a great guest!  Would be happy to host {{Guest First Name}} again anytime!",
        sendMessageAfterLeavingReview: true,
        disableMessageAfterReview: false,
        emailEnabled: false,
        email: "",
        smsEnabled: false,
        sms: "",
        delay: 0,
        preapprove: false,
        languagesEnabled: false
    });
  });

  test("should call correct params when select `reviewReminder`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Remind Guest to Review Template"));
    fireEvent.click(queryByText("Remind Guest to Review Template"));

    expect(queryByText("Remind Guest to Review Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        template: "reviewReminder",
        title: "Remind Guest to Review Rule",
        time: 16,
        days: 10,
        event: "checkout",
        reservationLength: 1,
        message:
            "Hi {{Guest First Name}},\n\n" +
            "Sorry to bother you but if you have a second, could you write us a review?  Reviews " +
            "are very important to us and help us maintain our Superhost status on Airbnb, we'd " +
            "really appreciate it.",
        lastMinuteMessageEnabled: false,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage: "",
        reviewEnabled: false,
        reviewMessage: "",
        sendMessageAfterLeavingReview: false,
        disableMessageAfterReview: false,
        emailEnabled: false,
        email: "",
        smsEnabled: false,
        sms: "",
        delay: 0,
        preapprove: false,
        languagesEnabled: false
    });
  });

  test("should call correct params when select `email`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("Email Cleaning Service Template"));
    fireEvent.click(queryByText("Email Cleaning Service Template"));

    expect(queryByText("Email Cleaning Service Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        title: "Email Rule",
        message:
            "Hi Cleaning Service,\n\n" +
            "We just got a new booking.  Can you please clean our place on {{Check-Out Date}} between {{Check-Out Time}} and {{Check-In Time}}?\n\n" +
            "Thanks!",
        event: "booking",
        lastMinuteMessageEnabled: false,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage: "",
        reviewEnabled: false,
        reviewMessage: "",
        sendMessageAfterLeavingReview: false,
        disableMessageAfterReview: false,
        emailEnabled: true,
        email: "",
        smsEnabled: false,
        sms: "",
        delay: 0,
        preapprove: false,
        languagesEnabled: false
    });
  });

  test("should call correct params when select `sms`", async () => {
    const {view, props} = setup();
    const {container} = view;
    const {queryByText} = screen;

    fireEvent.keyDown(container.firstChild, {key: "ArrowDown"});
    await waitFor(() => queryByText("SMS Cleaning Service Template"));
    fireEvent.click(queryByText("SMS Cleaning Service Template"));

    expect(queryByText("SMS Cleaning Service Template")).toBeInTheDocument();
    expect(props.onSelectedTemplate).toHaveBeenCalledWith({
        title: "SMS Rule",
        message:
            "Hi Cleaning Service,\n\n" +
            "We just got a new booking.  Can you please clean our place on {{Check-Out Date}} between {{Check-Out Time}} and {{Check-In Time}}?\n\n" +
            "Thanks!",
        event: "booking",
        lastMinuteMessageEnabled: false,
        lastMinuteMessageIsTheSame: false,
        lastMinuteMessage: "",
        reviewEnabled: false,
        reviewMessage: "",
        sendMessageAfterLeavingReview: false,
        disableMessageAfterReview: false,
        emailEnabled: false,
        email: "",
        smsEnabled: true,
        sms: "",
        delay: 0,
        preapprove: false,
        languagesEnabled: false
    });
  });
});
