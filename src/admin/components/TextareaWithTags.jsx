import classNames from "classnames";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {FiHelpCircle} from "react-icons/fi";
import {withRouter} from "react-router-dom";

import Languages from "../config/languages";
import {UserConsumer} from "../providers/UserProvider";
import {userType} from "../types";

import SelectLanguage from "./SelectLanguage";
import SelectMessageTags from "./SelectMessageTags";

class TextareaWithTags extends Component {
    constructor(props) {
        super(props);
        const {messages} = props;
        this.state = {
            value: messages.default,
            event: props.event,
            error: "",
            currentLanguage: "default"
        };
        this.textArea = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleCursorChange = this.handleCursorChange.bind(this);
        this.handleTag = this.handleTag.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {messages, event, error} = this.props;
        const nextMessages = nextProps.messages;
        const nextEvent = nextProps.event;
        const nextError = nextProps.error;
        if (
            JSON.stringify(messages) !== JSON.stringify(nextMessages) ||
            event !== nextEvent ||
            error !== nextError
        ) {
            const {currentLanguage} = this.state;
            this.setState({
                value: nextMessages[currentLanguage],
                event: nextEvent,
                error: nextError
            });
        }
    }

    handleChange(event) {
        const cursorPosition = event.target.selectionStart;
        const {value} = event.target;
        this.setState({value, cursorPosition});
        const {currentLanguage} = this.state;
        const {onChange} = this.props;
        onChange(value, currentLanguage);
    }

    handleCursorChange(event) {
        const cursorPosition = event.target.selectionStart;
        this.setState({cursorPosition});
    }

    async handleTag(tag) {
        try {
            let {value, cursorPosition} = this.state;
            if (cursorPosition === undefined) {
                cursorPosition = value.length;
            }
            const textBeforeCursorPosition = value.substring(0, cursorPosition);
            const textAfterCursorPosition = value.substring(cursorPosition, value.length);
            value = textBeforeCursorPosition + tag.value + textAfterCursorPosition;
            cursorPosition += tag.value.length;
            await this.setState({value, cursorPosition});
            this.textArea.current.focus();
            this.textArea.current.selectionStart = cursorPosition;
            this.textArea.current.selectionEnd = cursorPosition;
            const {currentLanguage} = this.state;
            const {onChange} = this.props;
            onChange(value, currentLanguage);
        } catch (error) {
            console.log("error", error);
        }
    }

    handleLanguageChange(option) {
        const {messages} = this.props;
        this.setState({currentLanguage: option.value, value: messages[option.value]});
    }

    render() {
        const {tooltip, languagesEnabled, messages, user} = this.props;
        let {label} = this.props;
        const {value, event, error} = this.state;
        const textAreaClasses = classNames("form-control bd-b-0", {
            "is-invalid": error,
            "bd-t-0": languagesEnabled
        });

        const overlay = <Tooltip>{tooltip}</Tooltip>;
        if (tooltip) {
            label += " ";
        }

        return (
            <div className="form-group">
                {label && (
                    <label
                        htmlFor="message"
                        className="az-content-label tx-11 tx-medium tx-gray-600"
                    >
                        {label}
                        {tooltip && (
                            <OverlayTrigger placement="right" overlay={overlay}>
                                <FiHelpCircle className="text-muted ml-1" />
                            </OverlayTrigger>
                        )}
                    </label>
                )}
                {languagesEnabled && (
                    <SelectLanguage
                        onSelectedOption={this.handleLanguageChange}
                        languageValues={messages}
                    />
                )}
                <textarea
                    id="message"
                    ref={this.textArea}
                    className={textAreaClasses}
                    rows="10"
                    value={value}
                    onChange={this.handleChange}
                    onClick={this.handleCursorChange}
                    onKeyUp={this.handleCursorChange}
                />
                <SelectMessageTags
                    onSelectedOption={this.handleTag}
                    isDisabled={false}
                    event={event}
                    error={error}
                    user={user}
                />
                {error && <div className="alert alert-danger">{error}</div>}
            </div>
        );
    }
}

TextareaWithTags.propTypes = {
    messages: PropTypes.shape(
        Languages.reduce((result, language) => {
            result[language.value] = PropTypes.string;
            return result;
        }, {})
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    event: PropTypes.string,
    error: PropTypes.string,
    label: PropTypes.string,
    tooltip: PropTypes.string,
    languagesEnabled: PropTypes.bool,
    user: userType.isRequired
};

TextareaWithTags.defaultProps = {
    event: "",
    error: "",
    label: "",
    tooltip: "",
    languagesEnabled: false
};

const ConnectedTextareaWithTags = props => (
    <UserConsumer>
        {({user, updateUser}) => (
            <TextareaWithTags {...props} user={user} updateUser={updateUser} />
        )}
    </UserConsumer>
);
export default withRouter(ConnectedTextareaWithTags);
