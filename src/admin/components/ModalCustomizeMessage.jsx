import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {withRouter} from "react-router-dom";

import {UserConsumer} from "../providers/UserProvider";

import TextareaWithTags from "./TextareaWithTags";

class ModalCustomizeMessage extends Component {
    constructor(props) {
        super(props);
        this.state = {message: "", error: "", showSpinner: false};
        this.textArea = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {show} = this.props;
        const nextShow = nextProps.show;
        if (nextShow && show !== nextShow) {
            const {message, messageRuleMessage} = nextProps;
            let messageText = message;
            if (!messageText) {
                messageText = messageRuleMessage;
            }
            this.setState({message: messageText, showSpinner: false});
        }
    }

    handleChange(message) {
        this.setState({message});
    }

    async handleSubmit() {
        try {
            let {message} = this.state;
            message = message.trim();
            let error = "";
            this.setState({error, showSpinner: true});
            if (message.length) {
                const {
                    onHide,
                    messageRuleMessage,
                    messageRuleID,
                    airbnbUserID,
                    airbnbListingID,
                    airbnbConfirmationCode
                } = this.props;
                const url = "/customizeMessage";
                const fields = {
                    message,
                    messageRuleMessage,
                    messageRuleID,
                    airbnbUserID,
                    airbnbListingID,
                    airbnbConfirmationCode
                };
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                if (response.ok) {
                    onHide(true);
                } else {
                    console.log("response", response);
                }
            } else {
                error = "You can't send a blank message.";
            }
            this.setState({error, showSpinner: false});
        } catch (error) {
            this.setState({showSpinner: false});
            console.log("error", error);
        }
    }

    handleReset() {
        const {messageRuleMessage} = this.props;
        this.setState({message: messageRuleMessage});
    }

    render() {
        const {show, onHide, sendEvent, user} = this.props;
        const {message, error, showSpinner} = this.state;
        return (
            <Modal show={show} onHide={onHide} backdrop="static">
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title>Customize Message</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <TextareaWithTags
                            languagesEnabled={false}
                            messages={{default: message}}
                            onChange={this.handleChange}
                            event={sendEvent}
                            error={error}
                            user={user}
                        />
                    </Modal.Body>

                    <Modal.Footer>
                        <button type="button" className="btn btn-outline-dark" onClick={onHide}>
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={this.handleReset}
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={this.handleSubmit}
                        >
                            {showSpinner && <FaCircleNotch data-testid="spinner" className="fa-spin mr-1" />}
                            Save
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}

ModalCustomizeMessage.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    message: PropTypes.string,
    messageRuleMessage: PropTypes.string,
    sendEvent: PropTypes.string,
    messageRuleID: PropTypes.string,
    airbnbUserID: PropTypes.string,
    airbnbListingID: PropTypes.string,
    airbnbConfirmationCode: PropTypes.string,
    user: PropTypes.shape({
        accounts: PropTypes.arrayOf(PropTypes.shape({})),
        badAccounts: PropTypes.arrayOf(PropTypes.shape({})),
        listings: PropTypes.arrayOf(PropTypes.shape({})),
        listingGroups: PropTypes.arrayOf(PropTypes.shape({})),
        tags: PropTypes.arrayOf(PropTypes.shape({}))
    }).isRequired
};
ModalCustomizeMessage.defaultProps = {
    message: "",
    messageRuleMessage: "",
    sendEvent: "",
    messageRuleID: "",
    airbnbUserID: "",
    airbnbListingID: "",
    airbnbConfirmationCode: ""
};

const ConnectedModalCustomizeMessage = props => (
    <UserConsumer>
        {({user, updateUser}) => (
            <ModalCustomizeMessage {...props} user={user} updateUser={updateUser} />
        )}
    </UserConsumer>
);
export default withRouter(ConnectedModalCustomizeMessage);
