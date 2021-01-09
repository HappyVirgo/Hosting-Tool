import classNames from "classnames";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {FaCircleNotch} from "react-icons/fa";
import {Link} from "react-router-dom";
import {
    CardCVCElement,
    CardExpiryElement,
    CardNumberElement,
    injectStripe
} from "react-stripe-elements";

import americanExpress from "../img/creditCards/AmericanExpress.png";
import creditCard from "../img/creditCards/CreditCard.png";
import dinersClub from "../img/creditCards/DinersClub.png";
import discover from "../img/creditCards/Discover.png";
import JCB from "../img/creditCards/JCB.png";
import masterCard from "../img/creditCards/Mastercard.png";
import unionPay from "../img/creditCards/UnionPay.png";
import visa from "../img/creditCards/Visa.png";

import SelectCountry from "./SelectCountry";

class CreditCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: {},
            brand: "unknown",
            showSpinner: false,
            fields: {}
        };
    }

    handleErrors = error => {
        const errors = {};
        switch (error.code) {
            case "invalid_number":
            case "incorrect_number":
            case "incomplete_number":
                errors.cardNumber = error.message;
                break;
            case "invalid_cvc":
            case "incomplete_cvc":
            case "incorrect_cvc":
                errors.cardCVC = error.message;
                break;
            case "invalid_expiry_year":
            case "invalid_expiry_month":
            case "invalid_expiry_year_past":
            case "incomplete_expiry":
                errors.cardExpiry = error.message;
                break;
            default:
                errors.error = error.message;
                break;
        }
        this.setState({errors});
    };

    handleStripeElementChange = ({error, brand}) => {
        if (error) {
            this.handleErrors(error);
        }
        this.setState({brand});
        this.loadInspectlet();
    };

    handleChange = (field, value) => {
        const {fields} = this.state;
        fields[field] = value;
        this.setState({fields});
        this.loadInspectlet();
    };

    handleSelectedOption = (field, option) => {
        const {fields} = this.state;
        fields[field] = option.value;
        this.setState({fields});
    };

    loadInspectlet = () => {
        const {user} = this.props;
        // eslint-disable-next-line no-underscore-dangle
        window.__insp = window.__insp || [];
        // eslint-disable-next-line no-undef
        __insp.push(["wid", 1206788301]);
        // eslint-disable-next-line no-undef
        __insp.push(["tagSession", "Credit Card"]);
        // eslint-disable-next-line no-undef
        __insp.push(["identify", user.username]);
        const ldinsp = () => {
            // eslint-disable-next-line no-underscore-dangle
            if (typeof window.__inspld != "undefined") return;
            // eslint-disable-next-line no-underscore-dangle
            window.__inspld = 1;
            const insp = document.createElement("script");
            insp.type = "text/javascript";
            insp.async = true;
            insp.id = "inspsync";
            insp.src = `${
                // eslint-disable-next-line eqeqeq
                document.location.protocol == "https:" ? "https" : "http"
            }://cdn.inspectlet.com/inspectlet.js?wid=1206788301&r=${Math.floor(
                new Date().getTime() / 3600000
            )}`;
            const x = document.getElementsByTagName("script")[0];
            x.parentNode.insertBefore(insp, x);
        };
        setTimeout(ldinsp, 0);
    };

    handleSubmit = async () => {
        try {
            const {
                fields: {name, zip, country}
            } = this.state;
            const errors = {};
            const showSpinner = true;
            this.setState({errors, showSpinner});
            const {stripe, user} = this.props;
            if (!name || name === "") {
                errors.name = "Please enter your name.";
                const showSpinner = false;
                this.setState({errors, showSpinner});
            } else if (!zip || zip === "") {
                errors.zip = "Please enter your zipcode.";
                const showSpinner = false;
                this.setState({errors, showSpinner});
            } else if (!country || country === "") {
                errors.country = "Please enter your country.";
                const showSpinner = false;
                this.setState({errors, showSpinner});
            } else if (stripe) {
                const {token, error} = await stripe.createToken({
                    name,
                    address_zip: zip,
                    address_country: country,
                    email: user.username
                });
                if (error) {
                    this.handleErrors(error);
                    const showSpinner = false;
                    this.setState({showSpinner});
                } else {
                    const {onSuccess} = this.props;
                    onSuccess(token.id);
                    this.clearCreditCard();
                    const showSpinner = false;
                    this.setState({showSpinner});
                }
            } else {
                errors.error = "Please allow the page to finish loading and try again.";
                const showSpinner = false;
                this.setState({errors, showSpinner});
            }
        } catch (error) {
            console.log("error", error);
        }
    };

    clearCreditCard = () => {
        this.cardNumber.clear();
        this.cardExpiry.clear();
        this.cardCVC.clear();
    };

    createOptions = () => {
        return {
            style: {
                base: {
                    fontSize: "14px",
                    // color: "#424770",
                    letterSpacing: "0.1em",
                    "::placeholder": {
                        color: "#888"
                    }
                },
                invalid: {
                    color: "#c23d4b"
                }
            }
        };
    };

    creditCardIcon = brand => {
        switch (brand) {
            case "visa":
                return <img src={visa} className="wd-30 mg-r-5" alt="" />;
            case "mastercard":
                return <img src={masterCard} className="wd-30" alt="" />;
            case "amex":
                return <img src={americanExpress} className="wd-30" alt="" />;
            case "diners":
                return <img src={dinersClub} className="wd-30" alt="" />;
            case "discover":
                return <img src={discover} className="wd-30" alt="" />;
            case "jcb":
                return <img src={JCB} className="wd-30" alt="" />;
            case "unionpay":
                return <img src={unionPay} className="wd-30" alt="" />;
            default:
                return <img src={creditCard} className="wd-30" alt="" />;
        }
    };

    render() {
        const {errors, brand, showSpinner, country} = this.state;
        const {invoice, error} = this.props;
        const nameClasses = classNames("form-control", {
            "is-invalid": errors.name
        });
        const zipClasses = classNames("form-control", {
            "is-invalid": errors.zip
        });
        const countryClasses = classNames("form-control", {
            "is-invalid": errors.country
        });
        const cardNumberClasses = classNames(
            "form-control",
            "d-flex",
            "justify-content-",
            " align-items-center",
            {
                "is-invalid": errors.cardNumber
            }
        );
        const cardExpiryClasses = classNames("form-control", "d-table", {
            "is-invalid": errors.cardExpiry
        });
        const cardCVCClasses = classNames("form-control", "d-table", {
            "is-invalid": errors.cardCVC
        });
        return (
            <div>
                <div className="form-group">
                    <label htmlFor="name" className="az-content-label tx-11 tx-medium tx-gray-600">
                        Name on Card
                    </label>
                    <input
                        id="name"
                        type="text"
                        className={nameClasses}
                        placeholder="Name"
                        onChange={event => {
                            this.handleChange("name", event.target.value);
                        }}
                    />
                    {errors.name && <div className="alert alert-danger">{errors.name}</div>}
                </div>
                <div className="form-group">
                    <label className="az-content-label tx-11 tx-medium tx-gray-600">
                        Card Number
                    </label>
                    <div className={cardNumberClasses}>
                        <div className="flex-grow-1">
                            <CardNumberElement
                                onChange={this.handleStripeElementChange}
                                onReady={c => {
                                    this.cardNumber = c;
                                }}
                                {...this.createOptions()}
                            />
                        </div>
                        {this.creditCardIcon(brand)}
                    </div>
                    {errors.cardNumber && (
                        <div className="alert alert-danger">{errors.cardNumber}</div>
                    )}
                </div>

                <div className="form-group">
                    <div className="row row-sm">
                        <div className="col-sm-7">
                            <label
                                htmlFor="card-expiry"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Expiration Date
                            </label>
                            <div className={cardExpiryClasses}>
                                <div className="d-table-cell align-middle">
                                    <CardExpiryElement
                                        onChange={this.handleStripeElementChange}
                                        onReady={c => {
                                            this.cardExpiry = c;
                                        }}
                                        {...this.createOptions()}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-5 mg-t-20 mg-sm-t-0">
                            <label className="az-content-label tx-11 tx-medium tx-gray-600">
                                CVC
                            </label>
                            <div className={cardCVCClasses}>
                                <div className="d-table-cell align-middle">
                                    <CardCVCElement
                                        onChange={this.handleStripeElementChange}
                                        onReady={c => {
                                            this.cardCVC = c;
                                        }}
                                        {...this.createOptions()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {errors.cardExpiry && (
                        <div className="alert alert-danger">{errors.cardExpiry}</div>
                    )}
                    {errors.cardCVC && <div className="alert alert-danger">{errors.cardCVC}</div>}
                </div>
                <div className="form-group">
                    <div className="row row-sm">
                        <div className="col-sm-5">
                            <label
                                htmlFor="zip"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Billing Zip Code
                            </label>
                            <input
                                id="zip"
                                type="text"
                                className={zipClasses}
                                placeholder="Zip Code"
                                onChange={event => {
                                    this.handleChange("zip", event.target.value);
                                }}
                            />
                        </div>
                        <div className="col-sm-7 mg-t-20 mg-sm-t-0">
                            <label
                                htmlFor="country"
                                className="az-content-label tx-11 tx-medium tx-gray-600"
                            >
                                Billing Country
                            </label>
                            <SelectCountry
                                id="days"
                                className={countryClasses}
                                selectedValue={country}
                                onSelectedOption={option => {
                                    this.handleSelectedOption("country", option);
                                }}
                                isDisabled={false}
                            />
                        </div>
                    </div>
                    {errors.country && <div className="alert alert-danger">{errors.country}</div>}
                    {errors.zip && <div className="alert alert-danger">{errors.zip}</div>}
                </div>
                {errors.error && <div className="alert alert-danger">{errors.error}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mg-t-20">{invoice}</div>
                <div className="mg-t-20">
                    <b>Note: </b>
                    {"You can enable or disable listings on the "}
                    <Link to="/settings">account settings page</Link>
                    {" and you will only be charged for enabled listings."}
                </div>
                <button
                    type="button"
                    className="btn btn-outline-primary btn-block justify-content-center mg-t-20"
                    onClick={this.handleSubmit}
                >
                    {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                    Subscribe
                </button>
            </div>
        );
    }
}

CreditCard.propTypes = {
    invoice: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    stripe: PropTypes.shape({createToken: PropTypes.func}).isRequired,
    onSuccess: PropTypes.func.isRequired,
    user: PropTypes.shape({username: PropTypes.string}).isRequired,
    error: PropTypes.string
};

CreditCard.defaultProps = {
    error: ""
};

export default injectStripe(CreditCard);
