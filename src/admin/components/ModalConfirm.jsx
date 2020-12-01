import classNames from "classnames";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";

class ModalConfirm extends Component {
    constructor(props) {
        super(props);
        this.state = {showSpinner: false, title: "", message: "", buttonText: "", type: false};
        this.handleConfirm = this.handleConfirm.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const {show} = this.props;
        const nextShow = nextProps.show;
        if (nextShow && show !== nextShow) {
            const {title, message, buttonText, type} = nextProps;
            this.setState({title, message, buttonText, showSpinner: false, type});
        }
    }

    handleConfirm() {
        const {onHide} = this.props;
        this.setState({showSpinner: true});
        onHide(true);
    }

    render() {
        const {show, onHide} = this.props;
        const {title, message, buttonText, showSpinner, type} = this.state;
        const buttonClassnames = classNames("btn", {
            "btn-outline-primary": !type,
            "btn-outline-danger": type === "danger"
        });
        return (
            <Modal show={show} onHide={onHide} backdrop="static">
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="pd-20 pd-sm-40">{message}</Modal.Body>

                    <Modal.Footer>
                        <button
                            type="button"
                            className="btn btn-outline-dark"
                            onClick={() => {
                                onHide();
                            }}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className={buttonClassnames}
                            onClick={this.handleConfirm}
                        >
                            {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                            {buttonText}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}

ModalConfirm.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    buttonText: PropTypes.string,
    type: PropTypes.string
};

ModalConfirm.defaultProps = {
    title: "",
    message: "",
    buttonText: "",
    type: ""
};
export default ModalConfirm;
