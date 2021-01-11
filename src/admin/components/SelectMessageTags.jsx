import "../css/react-select.css";

import classNames from "classnames";
import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {withRouter} from "react-router-dom";
import Select from "react-select";

import {UserConsumer} from "../providers/UserProvider";

function SelectMessageTags(props) {
    const {
        event,
        error,
        user: {tags},
        isDisabled,
        onSelectedOption
    } = props;

    const defaultOptions = [
        {value: "{{Listing Title}}", label: "Listing Title"},
        {value: "{{Listing Nickname}}", label: "Listing Nickname"},
        {value: "{{Listing ID}}", label: "Listing ID"},
        {value: "{{Listing Address}}", label: "Listing Address"},
        {
            value: "{{Check-In Guide URL}}",
            label: "Check-In Guide URL"
        },
        {value: "{{Guest First Name}}", label: "Guest First Name"},
        {value: "{{Check-In Date}}", label: "Check-In Date"},
        {value: "{{Check-In Time}}", label: "Check-In Time"},
        {value: "{{Check-Out Date}}", label: "Check-Out Date"},
        {value: "{{Check-Out Time}}", label: "Check-Out Time"},
        {value: "{{Check-In Date|YYYY-MM-DD}}", label: "Check-In Date Custom Format"},
        {value: "{{Check-In Time|HH}}", label: "Check-In Time Custom Format"},
        {value: "{{Check-Out Date|YYYY-MM-DD}}", label: "Check-Out Date Custom Format"},
        {value: "{{Check-Out Time|HH}}", label: "Check-Out Time Custom Format"},
        {value: "{{Number of Nights}}", label: "Number of Nights"},
        {value: "{{Number of Guests}}", label: "Number of Guests"}
    ];

    const [options, setOptions] = useState([]);

    useEffect(() => {
        setOptions(updateOptions(event, defaultOptions, tags));
    }, [event]);

    function handleChange(selectedOption) {
        onSelectedOption(selectedOption);
    }

    function updateOptions(event, defaultOptions, userTags) {
        let userTagsOptions = [];
        if (event !== "all") {
            userTagsOptions = userTags.map(userTag => {
                return {value: `{{${userTag.name}}}`, label: userTag.name};
            });
        }
        const options = [...userTagsOptions, ...defaultOptions];
        if (
            event === "checkin" ||
            event === "checkout" ||
            event === "occupied" ||
            event === "booking" ||
            event === "checkinChanged" ||
            event === "checkoutChanged" ||
            event === "numberOfGuestsChanged" ||
            event === "cancelled" ||
            event === "all"
        ) {
            options.splice(3, 0, {value: "{{Guest Last Name}}", label: "Guest Last Name"});
            options.push({value: "{{Confirmation Code}}", label: "Confirmation Code"});
            options.push({value: "{{Guest Phone}}", label: "Guest Phone Number"});
            options.push({
                value: "{{Guest Phone|4}}",
                label: "Guest's Phone Number Custom Length"
            });
            options.push({
                value: "{{Guest Lock Code}}",
                label: "Guest's Lock Code (Last 4 of Phone Number)"
            });
        }
        if (event === "checkinChanged" || event === "all") {
            options.push({
                value: "{{Previous Check-In Date}}",
                label: "Previous Check-In Date"
            });
        }
        if (event === "checkoutChanged" || event === "all") {
            options.push({
                value: "{{Previous Check-Out Date}}",
                label: "Previous Check-Out Date"
            });
        }
        if (event === "checkinChanged" || event === "checkinChanged" || event === "all") {
            options.push({
                value: "{{Previous Number of Nights}}",
                label: "Previous Number of Nights"
            });
        }
        if (event === "numberOfGuestsChanged" || event === "all") {
            options.push({
                value: "{{Previous Number of Guests}}",
                label: "Previous Number of Guests"
            });
        }
        return options;
    }

    const selectClasses = classNames("react-select", {
        "is-invalid": error
    });

    return (
        <Select
            key={JSON.stringify(options)}
            value={null}
            onChange={handleChange}
            options={options}
            isDisabled={isDisabled}
            isSearchable
            placeholder="Insert Tags..."
            components={{Option}}
            className={selectClasses}
            classNamePrefix="react-select"
        />
    );
}

const Option = props => {
    const {
        // eslint-disable-next-line react/prop-types
        children,
        // eslint-disable-next-line react/prop-types
        getStyles,
        // eslint-disable-next-line react/prop-types
        innerProps: {ref, ...restInnerProps},
        // eslint-disable-next-line react/prop-types
        data
    } = props;
    return (
        <div
            {...restInnerProps}
            ref={ref}
            style={getStyles("option", props)}
            className="d-flex justify-content-between"
        >
            {children}
            <span className="tx-gray-500 text-right">{` ${data.value}`}</span>
        </div>
    );
};

Option.propTypes = {
    children: PropTypes.elementType.isRequired,
    data: PropTypes.shape({
        value: PropTypes.string
    }).isRequired
};

SelectMessageTags.propTypes = {
    onSelectedOption: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    event: PropTypes.string.isRequired,
    error: PropTypes.string,
    user: PropTypes.shape({
        accounts: PropTypes.arrayOf(PropTypes.shape({})),
        badAccounts: PropTypes.arrayOf(PropTypes.shape({})),
        listings: PropTypes.arrayOf(PropTypes.shape({})),
        listingGroups: PropTypes.arrayOf(PropTypes.shape({})),
        tags: PropTypes.arrayOf(PropTypes.shape({}))
    }).isRequired
};

SelectMessageTags.defaultProps = {
    error: ""
};

const ConnectedSelectMessageTags = props => (
    <UserConsumer>
        {({user, updateUser}) => (
            <SelectMessageTags {...props} user={user} updateUser={updateUser} />
        )}
    </UserConsumer>
);
export default withRouter(ConnectedSelectMessageTags);
