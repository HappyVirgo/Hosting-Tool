import classNames from "classnames";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {FiHelpCircle} from "react-icons/fi";
import {withRouter} from "react-router-dom";

import {UserConsumer} from "../providers/UserProvider";

import TextareaWithTags from "./TextareaWithTags";

const checkForSpecialTags = value => {
    const warnings = [];
    if (value.search("{{Previous Check-In Date}}") !== -1) {
        warnings.push(
            "The {{Previous Check-In Date}} tag will not populate unless you use the 'Check-In Changed' event."
        );
    }
    if (value.search("{{Previous Number of Nights}}") !== -1) {
        warnings.push(
            "The {{Previous Number of Nights}} tag will not populate unless you use the 'Check-In Changed' or 'Check-Out Changed' events."
        );
    }
    if (value.search("{{Previous Check-Out Date}}") !== -1) {
        warnings.push(
            "The {{Previous Check-Out Date}} tag will not populate unless you use the 'Check-Out Changed' event."
        );
    }
    if (value.search("{{Previous Number of Guests}}") !== -1) {
        warnings.push(
            "The {{Previous Number of Guests}} tag will not populate unless you use the 'Number of Guests Changed' event."
        );
    }
    return warnings;
};

class ModalTag extends Component {
    constructor(props) {
        super(props);
        this.state = {name: "", text: "", errors: {}, showSpinner: false, warnings: []};
        this.textArea = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {show} = this.props;
        const nextShow = nextProps.show;
        if (nextShow && show !== nextShow) {
            const {
                tag: {name, text}
            } = nextProps;
            const warnings = checkForSpecialTags(text);
            this.setState({name, text, showSpinner: false, warnings});
        }
    }

    handleChange(field, value) {
        const result = {};
        result[field] = value;
        result.warnings = [];
        if (field === "text") {
            result.warnings = checkForSpecialTags(value);
        }
        this.setState(result);
    }

    async handleSubmit() {
        try {
            let {name} = this.state;
            const {text} = this.state;
            name = name.trim();
            const errors = {};
            this.setState({errors, showSpinner: true});
            if (name.length === 0) {
                errors.name = "Please add a tag name.";
            } else if (text.length === 0) {
                errors.text = "Please add some tag text.";
            } else {
                const {onHide} = this.props;
                const url = "/addTag";
                const fields = {
                    name,
                    text
                };
                const {tag} = this.props;
                if (tag._id) {
                    fields._id = tag._id;
                }
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
                    window.location = "/";
                }
            }
            this.setState({errors, showSpinner: false});
        } catch (error) {
            this.setState({showSpinner: false});
            console.log("error", error);
        }
    }

    render() {
        const {show, onHide, user} = this.props;
        const {name, text, errors, showSpinner, warnings} = this.state;
        const nameClasses = classNames("form-control", {
            "is-invalid": errors.name
        });
        const nameOverlay = (
            <Tooltip>
                The &apos;Name&apos; is what you will type in a message to use the tag surrounded by
                curly braces. For example, if you name your tag LOCKBOX_CODE you would type
                &#123;&#123;LOCKBOX_CODE&#125;&#125; in the message to use the tag.
            </Tooltip>
        );

        return (
            <Modal show={show} onHide={onHide} backdrop="static">
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title>Custom Message Tag</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="form-group">
                            <label
                                htmlFor="name"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Name
                                <OverlayTrigger placement="top" overlay={nameOverlay}>
                                    <FiHelpCircle className="text-muted ml-1" />
                                </OverlayTrigger>
                            </label>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">{"{{"}</span>
                                </div>
                                <input
                                    id="name"
                                    className={nameClasses}
                                    placeholder="Tag name..."
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={event => {
                                        this.handleChange("name", event.target.value);
                                    }}
                                    required
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text">{"}}"}</span>
                                </div>
                            </div>
                            {errors.name && <div className="alert alert-danger">{errors.name}</div>}
                        </div>
                        {warnings.length !== 0 && (
                            <div className="form-group">
                                {warnings.map((warning, idx) => {
                                    return (
                                        <div key={idx} className="alert alert-warning">
                                            <strong>Warning: </strong>
                                            {warning}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <TextareaWithTags
                            languagesEnabled={false}
                            messages={{default: text}}
                            onChange={value => {
                                this.handleChange("text", value);
                            }}
                            event="all"
                            label="Tag Text"
                            error={errors.text}
                            user={user}
                        />
                    </Modal.Body>

                    <Modal.Footer>
                        <button type="button" className="btn btn-outline-dark" onClick={onHide}>
                            Close
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

ModalTag.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    tag: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        text: PropTypes.string
    }),
    user: PropTypes.shape({
        accounts: PropTypes.arrayOf(PropTypes.shape({})),
        badAccounts: PropTypes.arrayOf(PropTypes.shape({})),
        listings: PropTypes.arrayOf(PropTypes.shape({})),
        listingGroups: PropTypes.arrayOf(PropTypes.shape({})),
        tags: PropTypes.arrayOf(PropTypes.shape({}))
    }).isRequired
};

ModalTag.defaultProps = {
    tag: {name: "", text: ""}
};

const ConnectedModalTag = props => (
    <UserConsumer>
        {({user, updateUser}) => <ModalTag {...props} user={user} updateUser={updateUser} />}
    </UserConsumer>
);
export default withRouter(ConnectedModalTag);
