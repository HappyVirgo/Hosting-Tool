import "../css/react-select.css";

import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import Select from "react-select";

function SelectMessageTemplates(props) {
    const {messageRules, selectedValue, isDisabled, onSelectedTemplate} = props;
    const defaultOptions = [
        {
            value: "booking",
            label: "Booking Confirmation Message Template",
            type: "Templates"
        },
        {
            value: "inquiry",
            label: "Booking Inquiry Message Template",
            type: "Templates"
        },
        {
            value: "timedout",
            label: "Pre-approval Expired Message Template",
            type: "Templates"
        },
        {
            value: "pending",
            label: "Booking Request Message Template",
            type: "Templates"
        },
        {
            value: "checkin",
            label: "Check-In Message Template",
            type: "Templates"
        },
        {
            value: "checkup",
            label: "Check-Up Message Template",
            type: "Templates"
        },
        {
            value: "checkout",
            label: "Check-Out Message Template",
            type: "Templates"
        },
        {
            value: "takeOutTheTrash",
            label: "Take Out The Trash",
            type: "Templates"
        },
        {
            value: "review",
            label: "Review Guest Template",
            type: "Templates"
        },
        {
            value: "reviewReminder",
            label: "Remind Guest to Review Template",
            type: "Templates"
        },
        {
            value: "email",
            label: "Email Cleaning Service Template",
            type: "Templates"
        },
        {
            value: "sms",
            label: "SMS Cleaning Service Template",
            type: "Templates"
        }
    ];

    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState([
        {
            label: "Templates",
            options: defaultOptions
        }
    ]);

    useEffect(() => {
        groupOptions(messageRules);
    }, [messageRules]);

    useEffect(() => {
        let selectedOption = options.find(group => {
            return group.options.find(option => {
                return option.value === selectedValue;
            });
        });
        if (!selectedOption) {
            selectedOption = null;
        }
        setSelectedOption(selectedOption);
    }, [selectedValue]);

    function groupOptions(messageRules) {
        const groupBy = (xs, key) => {
            return xs.reduce((rv, x) => {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        const templates = messageRules.reduce((result, rule, index, messageRules) => {
            result.push({
                label: rule.title,
                value: rule._id,
                type: rule.type
            });
            return result;
        }, []);
        const groupedTemplates = groupBy(templates, "type");
        const newOptions = [
            {
                label: "Templates",
                options: defaultOptions
            }
        ];

        const keys = Object.keys(groupedTemplates);
        keys.reverse();
        for (const key of keys) {
            newOptions.push({
                label: key,
                options: groupedTemplates[key]
            });
        }
        setOptions(newOptions);
    }

    function handleChange(selectedOption) {
        setSelectedOption(selectedOption);
        const template = selectTemplate(selectedOption.value);
        onSelectedTemplate(template);
    }

    function selectTemplate(templateName) {
        let template = messageRules.find(messageRule => {
            return messageRule._id === templateName;
        });
        if (template) {
            delete template._id;
        } else {
            switch (templateName) {
                case "booking":
                    // This one is tricky.  Have to set the event, title and message, then trigger the onEventChange and then set the template
                    template = {
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
                    };

                    break;
                case "inquiry":
                    // This one is tricky.  Have to set the event, title and message, then trigger the onEventChange and then set the template
                    template = {
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
                    };

                    break;
                case "timedout":
                    // This one is tricky.  Have to set the event, title and message, then trigger the onEventChange and then set the template
                    template = {
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
                    };

                    break;
                case "pending":
                    // This one is tricky.  Have to set the event, title and message, then trigger the onEventChange and then set the template
                    template = {
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
                    };

                    break;
                case "checkin":
                    template = {
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
                    };
                    break;
                case "checkup":
                    template = {
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
                    };
                    break;
                case "checkout":
                    template = {
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
                    };
                    break;
                case "takeOutTheTrash":
                    template = {
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
                    };
                    break;
                case "review":
                    template = {
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
                    };
                    break;
                case "reviewReminder":
                    template = {
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
                    };
                    break;
                case "email":
                    // This one is tricky.  Have to set the event, title and message, then trigger the onEventChange and then set the template
                    template = {
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
                    };

                    break;
                case "sms":
                    // This one is tricky.  Have to set the event, title and message, then trigger the onEventChange and then set the template
                    template = {
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
                    };

                    break;
                case "custom":
                    break;
                default:
                    template = {
                        template: "custom",
                        title: "",
                        time: 17,
                        days: -2,
                        event: "checkout",
                        reservationLength: 1,
                        message: "",
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
                        languagesEnabled: false,
                        _id: false
                    };
                    break;
            }
        }
        return template;
    }

    const formatGroupLabel = data => (
        <div className="az-content-label tx-12 tx-medium tx-gray-600">{data.label}</div>
    );

    return (
        <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            isDisabled={isDisabled}
            isSearchable
            placeholder="Templates..."
            formatGroupLabel={formatGroupLabel}
            className="react-select"
            classNamePrefix="react-select"
        />
    );
}

SelectMessageTemplates.propTypes = {
    onSelectedTemplate: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    messageRules: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string,
            time: PropTypes.number,
            days: PropTypes.number,
            event: PropTypes.string,
            reservationLength: PropTypes.number,
            isLimited: PropTypes.bool,
            limitEvent: PropTypes.string,
            limitDays: PropTypes.shape({
                monday: PropTypes.bool,
                tuesday: PropTypes.bool,
                wednesday: PropTypes.bool,
                thursday: PropTypes.bool,
                friday: PropTypes.bool,
                saturday: PropTypes.bool,
                sunday: PropTypes.bool
            }),
            dayOfTheWeek: PropTypes.string,
            airbnbUserID: PropTypes.string,
            airbnbListingID: PropTypes.string,
            message: PropTypes.string,
            lastMinuteMessage: PropTypes.string,
            lastMinuteMessageEnabled: PropTypes.bool,
            reviewEnabled: PropTypes.bool,
            reviewMessage: PropTypes.string,
            sendMessageAfterLeavingReview: PropTypes.bool,
            disableMessageAfterReview: PropTypes.bool,
            emailEnabled: PropTypes.bool,
            email: PropTypes.string,
            smsEnabled: PropTypes.bool,
            sms: PropTypes.string,
            delay: PropTypes.number,
            preapprove: PropTypes.bool,
            _id: PropTypes.string
        })
    ).isRequired,
    selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

SelectMessageTemplates.defaultProps = {
    isDisabled: false,
    selectedValue: ""
};

export default SelectMessageTemplates;
