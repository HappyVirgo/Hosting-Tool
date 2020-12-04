import classNames from "classnames";
import React, {Component} from "react";
import {FaCircleNotch} from "react-icons/fa";

class ContactForm extends Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            fields: {},
            errors: {}
        };
        this.handleChange = this.handleChange.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    handleChange(e) {
        const {fields} = this.state;
        fields[e.target.name] = e.target.value;
        this.setState({
            fields
        });
    }

    async submitForm(event) {
        const {isLoading} = this.state;
        event.preventDefault();
        if (!isLoading && this.validateForm()) {
            let {fields} = this.state;
            this.setState({isLoading: true});
            const url = "/contactUs";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            if (response.ok) {
                fields = {};
                fields.name = "";
                fields.email = "";
                fields.message = "";
                this.setState({fields});
            } else {
                const data = await response.json();
                const errors = {general: data.error.error_message};
                this.setState({errors});
            }
            this.setState({isLoading: false});
            // if (data.type && data.type !== "unknown") {
            //     history.push(`/${data.type}/${data.id}`);
            // }
        }
    }

    validateForm() {
        const {fields} = this.state;
        const errors = {};
        let formIsValid = true;

        if (!fields.name) {
            formIsValid = false;
            errors.name = "Missing name.";
        }

        if (!fields.email) {
            formIsValid = false;
            errors.email = "Missing email.";
        }

        if (typeof fields.email !== "undefined") {
            // regular expression for email validation
            const pattern = new RegExp(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
            );
            if (!pattern.test(fields.email)) {
                formIsValid = false;
                errors.email = "Please enter a valid email.";
            }
        }

        if (!fields.message) {
            formIsValid = false;
            errors.message = "Please include me a message.";
        }

        this.setState({
            errors
        });
        return formIsValid;
    }

    render() {
        const {fields, errors, isLoading} = this.state;

        const nameClasses = classNames("form-control", {
            "is-invalid": errors.name
        });
        const emailClasses = classNames("form-control", {
            "is-invalid": errors.email
        });
        const messageClasses = classNames("form-control", {
            "is-invalid": errors.message
        });
        return (
            <form id="contact-form" name="Contact Form" onSubmit={this.submitForm} noValidate>
                <div className="messages" />
                <div className="controls">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className={nameClasses}
                                    id="name"
                                    defaultValue={fields.name}
                                    onChange={this.handleChange}
                                />
                                {errors.name && (
                                    <h5 className="invalid-feedback d-block">{errors.name}</h5>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="text"
                                    name="email"
                                    className={emailClasses}
                                    id="email"
                                    defaultValue={fields.email}
                                    onChange={this.handleChange}
                                />
                                <div className="help-block with-errors" />
                            </div>
                            {errors.email && (
                                <h5 className="invalid-feedback d-block">{errors.email}</h5>
                            )}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className={messageClasses}
                                    rows="4"
                                    defaultValue={fields.message}
                                    onChange={this.handleChange}
                                />
                            </div>
                            {errors.message && (
                                <div className="form-group">
                                    <h5 className="invalid-feedback d-block">{errors.message}</h5>
                                </div>
                            )}
                            {errors.general && (
                                <div className="form-group">
                                    <h5 className="invalid-feedback d-block">{errors.general}</h5>
                                </div>
                            )}
                            <button type="submit" className="btn btn-block btn-send">
                                {isLoading ? <FaCircleNotch className="fa-spin mr-1" /> : ""}
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

export default ContactForm;
