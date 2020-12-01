import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {withRouter} from "react-router-dom";

import {UserConsumer} from "../providers/UserProvider";

import TextareaWithTags from "./TextareaWithTags";

class ModalCustomizeReview extends Component {
    constructor(props) {
        super(props);
        this.state = {review: "", error: "", showSpinner: false};
        this.textArea = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const {show} = this.props;
        const nextShow = nextProps.show;
        if (nextShow && show !== nextShow) {
            const {review, messageRuleReview} = nextProps;
            let reviewText = review;
            if (!reviewText) {
                reviewText = messageRuleReview;
            }
            this.setState({review: reviewText, showSpinner: false});
        }
    }

    handleChange(review) {
        this.setState({review});
    }

    async handleSubmit() {
        try {
            let {review} = this.state;
            review = review.trim();
            let error = "";
            this.setState({error, showSpinner: true});
            if (review.length) {
                const {
                    onHide,
                    messageRuleID,
                    airbnbUserID,
                    airbnbListingID,
                    airbnbConfirmationCode
                } = this.props;
                const url = "/customizeReview";
                const fields = {
                    review,
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
                error = "You can't send a blank review.";
            }
            this.setState({error, showSpinner: false});
        } catch (error) {
            this.setState({showSpinner: false});
            console.log("error", error);
        }
    }

    handleReset() {
        const {messageRuleReview} = this.props;
        this.setState({review: messageRuleReview});
    }

    render() {
        const {show, onHide, sendEvent, user} = this.props;
        const {review, error, showSpinner} = this.state;
        return (
            <Modal show={show} onHide={onHide} backdrop="static">
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title>Customize Review</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="pd-20 pd-sm-40">
                        <TextareaWithTags
                            languagesEnabled={false}
                            messages={{default: review}}
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
                            {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                            Save
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}

ModalCustomizeReview.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    review: PropTypes.string,
    messageRuleReview: PropTypes.string,
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

ModalCustomizeReview.defaultProps = {
    review: "",
    messageRuleReview: "",
    sendEvent: "",
    messageRuleID: "",
    airbnbUserID: "",
    airbnbListingID: "",
    airbnbConfirmationCode: ""
};

const ConnectedModalCustomizeReview = props => (
    <UserConsumer>
        {({user, updateUser}) => (
            <ModalCustomizeReview {...props} user={user} updateUser={updateUser} />
        )}
    </UserConsumer>
);
export default withRouter(ConnectedModalCustomizeReview);
