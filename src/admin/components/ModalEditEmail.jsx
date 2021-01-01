import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {Modal} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import classNames from "classnames";

function ModalEditEmail(props) {
    const {show, onHide, editEmail} = props;

    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [showSpinner, setShowSpinner] = useState(false);

    useEffect(() => {
        if (show) {
            setEmail(editEmail.email);
        }
        setShowSpinner(false);
    }, [show]);

    function handleChange(email) {
        setEmail(email);
    }

    async function handleSubmit() {
        try {
            if (validateEmail()) {
                setShowSpinner(true);
                let url = "/editAccountEmail";
                if (editEmail.type === "user") {
                    url = "/editUserEmail";
                }
                const fields = {...editEmail, ...{email}};
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                console.log("response.ok", response.ok);
                console.log("response", response, response.json());
                if (response.ok) {
                    onHide(true);
                } else {
                    console.log("response", response, response.json());
                    setErrors(response.json());
                }
            }
        } catch (error) {
            setShowSpinner(false);
            console.log("error", error);
        }
    }

    function validateEmail() {
        const errors = {};
        let formIsValid = true;
        if (!email) {
            formIsValid = false;
            errors.email = "Please enter an email address.";
        } else {
            const re = /\S+@\S+\.\S+/;
            const validEmail = re.test(email);
            if (!validEmail) {
                formIsValid = false;
                errors.email = "Please enter a valid email address.";
            }
        }
        setErrors(errors);
        return formIsValid;
    }

    const emailClasses = classNames("form-control", {
        "is-invalid": errors.email
    });

    return (
        <Modal show={show} onHide={onHide} backdrop="static">
            <form>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Email</Modal.Title>
                </Modal.Header>

                <Modal.Body className="pd-20 pd-sm-40">
                    <div className="form-group">
                        <label
                            htmlFor="email"
                            className="az-content-label tx-11 tx-medium tx-gray-600"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            className={emailClasses}
                            placeholder="Airbnb Email..."
                            name="email"
                            type="text"
                            autoComplete="off"
                            value={email}
                            onChange={event => {
                                handleChange(event.target.value);
                            }}
                            required
                        />
                        {errors.email && <div className="alert alert-danger">{errors.email}</div>}
                    </div>
                    {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className="btn btn-outline-dark" onClick={onHide}>
                        Close
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleSubmit}
                    >
                        {showSpinner && <FaCircleNotch data-testid="spinner" className="fa-spin mr-1" />}
                        Save
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

ModalEditEmail.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    editEmail: PropTypes.shape({
        id: PropTypes.string,
        type: PropTypes.string,
        email: PropTypes.string
    }).isRequired
};

export default ModalEditEmail;
