import PropTypes from "prop-types";
import React, {PureComponent} from "react";
import {Modal} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import {injectStripe} from "react-stripe-elements";

import CreditCard from "./CreditCard";

class ModalCreditCard extends PureComponent {
    render() {
        const {show, onHide, onSuccess, invoice, user, error} = this.props;

        return (
            <Modal show={show} onHide={onHide} backdrop="static">
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title>Your Payment Details</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="pd-20 pd-sm-40">
                        <CreditCard
                            invoice={invoice}
                            onSuccess={onSuccess}
                            user={user}
                            error={error}
                            hideSubscribeButton
                        />
                    </Modal.Body>
                </form>
            </Modal>
        );
    }
}

ModalCreditCard.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    invoice: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    stripe: PropTypes.shape({createToken: PropTypes.func}).isRequired,
    onSuccess: PropTypes.func.isRequired,
    user: PropTypes.shape({username: PropTypes.string}).isRequired,
    error: PropTypes.string
};

ModalCreditCard.defaultProps = {
    error: ""
};

export default withRouter(injectStripe(ModalCreditCard));
