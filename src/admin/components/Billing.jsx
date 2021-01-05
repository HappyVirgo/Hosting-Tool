import PropTypes from "prop-types";
import React, {Component} from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";
import {FaCircleNotch} from "react-icons/fa";
import {
    FiCheck,
    FiChevronRight,
    FiCreditCard,
    FiDownload,
    FiEdit2,
    FiHelpCircle,
    FiX
} from "react-icons/fi";
import {withRouter} from "react-router-dom";
import ReactRouterPropTypes from "react-router-prop-types";
import {Elements, StripeProvider} from "react-stripe-elements";

import americanExpress from "../img/creditCards/AmericanExpress.png";
import creditCard from "../img/creditCards/CreditCard.png";
import dinersClub from "../img/creditCards/DinersClub.png";
import discover from "../img/creditCards/Discover.png";
import JCB from "../img/creditCards/JCB.png";
import masterCard from "../img/creditCards/Mastercard.png";
import unionPay from "../img/creditCards/UnionPay.png";
import visa from "../img/creditCards/Visa.png";
import {UserConsumer} from "../providers/UserProvider";

import CreditCard from "./CreditCard";
import Errors from "./Errors";
import ModalConfirm from "./ModalConfirm";
import ModalCreditCard from "./ModalCreditCard";

class Billing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: {},
            showSpinner: {},
            showConfirmModal: false,
            confirmModal: {},
            showCreditCardModal: false,
            billing: {isFiller: true, invoices: []}
        };
        this.getBilling = this.getBilling.bind(this);
        this.handleShowConfirmModal = this.handleShowConfirmModal.bind(this);
        this.handleCloseConfirmModal = this.handleCloseConfirmModal.bind(this);
        this.showCancelSubscription = this.showCancelSubscription.bind(this);
        this.handleCreditCardSuccess = this.handleCreditCardSuccess.bind(this);
        this.handleShowCreditCardModal = this.handleShowCreditCardModal.bind(this);
        this.handleCloseCreditCardModal = this.handleCloseCreditCardModal.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        // this.loadGoogleReview = this.loadGoogleReview.bind(this);
    }

    componentDidMount() {
        this.getBilling();

        const tagManagerArgs = {
            dataLayer: {
                page: "Billing"
            }
        };
        TagManager.dataLayer(tagManagerArgs);
    }

    handleShowConfirmModal(confirmModal) {
        this.setState({showConfirmModal: true, confirmModal});
    }

    async handleCloseConfirmModal(isDelete) {
        try {
            if (isDelete) {
                const fields = {};
                const url = "/cancelSubscription";
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(fields)
                });
                if (response.ok) {
                    const {billing} = this.state;
                    const tagManagerArgs = {
                        dataLayer: {
                            event: "Subscription Canceled Event",
                            category: "superhosttools",
                            action: "subscription",
                            label: "canceled",
                            value: billing.activeListings * -5
                        }
                    };
                    TagManager.dataLayer(tagManagerArgs);
                    const {updateUser} = this.props;
                    await updateUser();
                    this.getBilling();
                } else {
                    window.location = "/";
                }
            }
            this.setState({showConfirmModal: false});
        } catch (error) {
            this.setState({showConfirmModal: false});
        }
    }

    async onRefresh() {
        const {updateUser} = this.props;
        await updateUser();
        await this.getBilling();
    }

    async getBilling() {
        const url = "/getBilling/";
        const response = await fetch(url);
        if (response.ok) {
            const billing = await response.json();
            this.setState({billing});
        } else {
            window.location = "/";
        }
    }

    showCancelSubscription() {
        this.handleShowConfirmModal({
            title: "Cancel subscription?",
            message:
                "Are you sure you would like to cancel your HostTools.com subscription?  Did you know you can disable listings and only be charged for listings you're actually using?",
            buttonText: "Cancel Subscription",
            type: "danger"
        });
    }

    async handleCreditCardSuccess(token) {
        try {
            const fields = {token};
            const url = "/subscribe";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            if (response.ok) {
                const {billing} = this.state;
                const tagManagerArgs = {
                    dataLayer: {
                        event: "Subscription Subscribed Event",
                        category: "superhosttools",
                        action: "subscription",
                        label: "subscribed",
                        value: billing.activeListings * 5
                    }
                };
                TagManager.dataLayer(tagManagerArgs);

                ReactPixel.fbq("track", "Subscribe", {
                    currency: "USD",
                    value: `${billing.activeListings * 5}.00`
                });
                // this.loadGoogleReview();
                this.getBilling();
                this.handleCloseCreditCardModal();
            } else {
                const {errors} = this.state;
                const error = await response.json();
                errors.creditCard = error.error;
                this.setState({errors});
                // window.location = "/";
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    handleShowCreditCardModal() {
        this.setState({showCreditCardModal: true});
    }

    handleCloseCreditCardModal() {
        this.setState({showCreditCardModal: false});
    }

    // loadGoogleReview() {
    //     const {user} = this.props;
    //     const email = user.username;
    //     const orderID = user.username;
    //     const loadGR = () => {
    //         // eslint-disable-next-line no-underscore-dangle
    //         if (typeof window.__googleReview != "undefined") return;
    //         // eslint-disable-next-line no-underscore-dangle
    //         window.__googleReview = 1;
    //         const googleReview = document.createElement("script");
    //         googleReview.type = "text/javascript";
    //         googleReview.async = true;
    //         googleReview.id = "googleReview";
    //         googleReview.src = "https://apis.google.com/js/platform.js?onload=renderOptIn";
    //         const x = document.getElementsByTagName("script")[0];
    //         x.parentNode.insertBefore(googleReview, x);
    //         window.renderOptIn = () => {
    //             window.gapi.load("surveyoptin", () => {
    //                 window.gapi.surveyoptin.render({
    //                     merchant_id: 138809156,
    //                     order_id: orderID,
    //                     email,
    //                     delivery_country: "US",
    //                     estimated_delivery_date: format(new Date(), "yyyy-MM-dd")
    //                 });
    //             });
    //         };
    //     };
    //     setTimeout(loadGR, 0);
    // }

    creditCardIcon() {
        const {
            billing: {
                creditCard: {brand}
            }
        } = this.state;
        switch (brand) {
            case "Visa":
                return <img src={visa} className="wd-40 mg-r-5" alt="" />;
            case "MasterCard":
                return <img src={masterCard} className="wd-40" alt="" />;
            case "American Express":
                return <img src={americanExpress} className="wd-40" alt="" />;
            case "Diners Club":
                return <img src={dinersClub} className="wd-40" alt="" />;
            case "Discover":
                return <img src={discover} className="wd-40" alt="" />;
            case "JCB":
                return <img src={JCB} className="wd-40" alt="" />;
            case "UnionPay":
                return <img src={unionPay} className="wd-40" alt="" />;
            default:
                return <img src={creditCard} className="wd-40" alt="" />;
        }
    }

    render() {
        const {
            errors,
            showConfirmModal,
            confirmModal,
            showCreditCardModal,
            showSpinner,
            billing
        } = this.state;
        const {user} = this.props;

        let subscriptionStatusText = (
            <strong className="tx-success">
                <FiCheck className="mr-1" />
                Active
            </strong>
        );
        if (billing.isBeta) {
            subscriptionStatusText = (
                <strong className="tx-success">
                    <FiCheck className="mr-1" />
                    Beta
                </strong>
            );
        } else if (billing.subscriptionStatus === "trialing") {
            subscriptionStatusText = (
                <strong className="tx-success">
                    <FiCheck className="mr-1" />
                    Trial
                </strong>
            );
        } else if (billing.subscriptionStatus === "trial_ended") {
            subscriptionStatusText = (
                <strong className="tx-danger">
                    <FiX />
                    Trial Ended
                </strong>
            );
        } else if (billing.subscriptionStatus !== "active") {
            subscriptionStatusText = (
                <strong className="tx-danger">
                    <FiX />
                    Canceled
                </strong>
            );
        }

        const subscriptionDetailsOverlay = (
            <Tooltip>
                Subscriptions are calculated by taking the total number of active listings and
                multiplying it by the monthly subscription fee.
            </Tooltip>
        );
        const invoice = (
            <div className="table-responsive">
                <table className="table table-hover mg-b-0">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th className="tx-center">Qty</th>
                            <th className="tx-right">Unit Price</th>
                            <th className="tx-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Listings</td>
                            <td className="tx-center">{billing.activeListings}</td>
                            <td className="tx-right">{billing.formattedPricePerListing}</td>
                            <td className="tx-right">{billing.formattedTotalPaymentPerMonth}</td>
                        </tr>
                        <tr>
                            <td
                                colSpan="3"
                                className="tx-right tx-uppercase tx-bold tx-inverse bg-gray-100"
                            >
                                Total Per Month
                            </td>
                            <td className="tx-right tx-bold bg-gray-100">
                                {billing.formattedTotalPaymentPerMonth}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );

        return (
            <div className="az-content">
                <Errors errors={errors} onRefresh={this.onRefresh} />
                <div className="container">
                    <div className="az-content-body pd-b-20">
                        <div className="d-flex justify-content-between mb-3">
                            <div>
                                <div className="az-content-breadcrumb">
                                    <span>Home</span>
                                    <FiChevronRight />
                                    <span>Billing</span>
                                </div>
                                <h2 className="az-content-title mb-0">Billing Details</h2>
                            </div>
                        </div>
                        {billing.isFiller && (
                            <div className="row mg-t-20">
                                <div className="col-md-7 col-lg-7">
                                    <div className="card card-body mg-b-30">
                                        <h5 className="card-title mg-b-20"> </h5>
                                        <div className="pd-60" />
                                    </div>
                                </div>
                                <div className="col-md-5 col-lg-5">
                                    <div className="card mg-b-30">
                                        <div className="card-body">
                                            <div className="mg-b-20 d-flex justify-content-between align-items-center">
                                                <h5 className="card-title mg-b-0"> </h5>
                                                <div className="pd-30" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!billing.isFiller &&
                            (billing.subscriptionStatus !== "active" || !billing.creditCard) && (
                                <div className="row mg-t-20">
                                    <div className="col-md-6 col-lg-7">
                                        <div className="card card-body">
                                            <h4 className="mg-10">
                                                Enjoy the peace of mind of knowing your guests are
                                                getting the attention they need without you being
                                                attached to your computer.
                                            </h4>
                                            <div className="pd-l-10 mt-3 mb-2 d-flex justify-content-start align-items-center">
                                                <FiCheck className="pr-2" />
                                                <h5 className="card-title m-0">
                                                    Automated Messaging
                                                </h5>
                                            </div>
                                            <p className="pd-l-30 pd-r-30">
                                                Send your guests personalized, automated messages.
                                                Send them check-in instructions a day before they
                                                check in or a check-up message after their first
                                                night. Fully customizable, options are limitless.
                                            </p>

                                            <div className="pd-l-10 mt-3 mb-2 d-flex justify-content-start align-items-center">
                                                <FiCheck className="pr-2" />
                                                <h5 className="card-title m-0">
                                                    Automated Reviews
                                                </h5>
                                            </div>
                                            <p className="pd-l-30 pd-r-30">
                                                Automatically review guests after check out and send
                                                them a message letting them know you left a 5-star
                                                review and ask that they leave a review in return.
                                            </p>

                                            <div className="pd-l-10 mt-3 mb-2 d-flex justify-content-start align-items-center">
                                                <FiCheck className="pr-2" />
                                                <h5 className="card-title m-0">
                                                    Highly Customizable Pricing Engine
                                                </h5>
                                            </div>
                                            <p className="pd-l-30 pd-r-30">
                                                Fine tune your prices to your heart&apos;s content
                                                using our rule-based pricing engine and
                                                Airbnb&apos;s Smart Pricing data. Add a rule to
                                                increase Airbnb&apos;s Smart Pricing by a dollar
                                                amount or a percentage. Increase or decrease prices
                                                over a period of time or add rules for orphan days
                                                (a short period between bookings).
                                            </p>

                                            <div className="pd-l-10 mt-3 mb-2 d-flex justify-content-start align-items-center">
                                                <FiCheck className="pr-2" />
                                                <h5 className="card-title m-0">
                                                    Automated Cleaner Notifications Via Email & SMS
                                                </h5>
                                            </div>
                                            <p className="pd-l-30 pd-r-30">
                                                Send your cleaners an email or SMS message every
                                                time you get a new booking and another to remind
                                                them the morning of the cleaning.
                                            </p>

                                            <div className="pd-l-10 mt-3 mb-2 d-flex justify-content-start align-items-center">
                                                <FiCheck className="pr-2" />
                                                <h5 className="card-title m-0">
                                                    Automated Pre-approve
                                                </h5>
                                            </div>
                                            <p className="pd-l-30 pd-r-30">
                                                Keep your response rate up by automatically
                                                pre-approving and messaging guests if you don&apos;t
                                                respond in a pre-determined amount of time.
                                            </p>

                                            <div className="pd-l-10 mt-3 mb-2 d-flex justify-content-start align-items-center">
                                                <FiCheck className="pr-2" />
                                                <h5 className="card-title m-0">
                                                    Multiple Listings
                                                </h5>
                                            </div>
                                            <p className="pd-l-30 pd-r-30">
                                                Manage multiple listings easily by creating messages
                                                that are sent to all listings.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-lg-5">
                                        <div className="card card-body mg-b-30">
                                            <h5 className="card-title mg-b-20">
                                                Your Payment Details
                                            </h5>
                                            {!billing.isFiller && (
                                                <StripeProvider
                                                    apiKey={billing.stripPublishableAPIKey}
                                                >
                                                    <Elements>
                                                        <CreditCard
                                                            invoice={invoice}
                                                            onSuccess={this.handleCreditCardSuccess}
                                                            user={user}
                                                            error={errors.creditCard}
                                                        />
                                                    </Elements>
                                                </StripeProvider>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        {(billing.subscriptionStatus === "active" ||
                            billing.subscriptionStatus === "trialing") &&
                            billing.creditCard && (
                                <div className="row mg-t-20">
                                    <div className="col-md-7 col-lg-7">
                                        <div className="card card-body mg-b-30">
                                            <h5 className="card-title mg-b-20">
                                                Subscription Details
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={subscriptionDetailsOverlay}
                                                >
                                                    <FiHelpCircle className="text-muted ml-1" />
                                                </OverlayTrigger>
                                            </h5>

                                            {invoice}
                                        </div>
                                    </div>
                                    <div className="col-md-5 col-lg-5">
                                        <div className="card mg-b-30">
                                            <div className="card-body">
                                                {!billing.subscriptionEndDate && (
                                                    <div className="mg-b-20 d-flex justify-content-between align-items-center">
                                                        <h5 className="card-title mg-b-0">
                                                            Subscription Status
                                                        </h5>
                                                        {subscriptionStatusText}
                                                    </div>
                                                )}
                                                {billing.subscriptionEndDate && (
                                                    <div className="mg-b-20 d-flex justify-content-between align-items-center">
                                                        <h5 className="card-title mg-b-0">
                                                            Subscription Ending
                                                        </h5>
                                                        <strong>
                                                            {billing.subscriptionEndDate}
                                                        </strong>
                                                    </div>
                                                )}
                                                {billing.creditCard && (
                                                    <div className="row mg-t-15">
                                                        <div className="col-sm-3 d-flex align-items-center justify-content-end">
                                                            {this.creditCardIcon()}
                                                        </div>
                                                        <div className="col-sm-5">
                                                            <div>
                                                                {"Ending in "}
                                                                <strong>
                                                                    {billing.creditCard.last4}
                                                                </strong>
                                                            </div>
                                                            <div>
                                                                {"Expires "}
                                                                <strong>
                                                                    {`${billing.creditCard.exp_month}/${billing.creditCard.exp_year}`}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-4 d-flex align-items-center justify-content-end">
                                                            <button
                                                                type="button"
                                                                className="btn btn-xs btn-outline-dark"
                                                                onClick={
                                                                    this.handleShowCreditCardModal
                                                                }
                                                            >
                                                                <FiEdit2 className="mr-1" />
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {!billing.creditCard && (
                                                    <div className="">
                                                        <p>No credit card on file</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        {billing.invoices.length !== 0 && (
                            <div className="row mg-t-20">
                                <div className="col-md-12">
                                    <div className="card card-body mg-b-30">
                                        <h5 className="card-title mg-b-20">Billing History</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Description</th>
                                                        <th className="tx-right">Amount</th>
                                                        <th className="tx-right">Status</th>
                                                        <th className="tx-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {billing.invoices.map(invoice => {
                                                        return (
                                                            <tr key={invoice.id}>
                                                                <td>{invoice.formattedDate}</td>
                                                                <td>
                                                                    {invoice.formattedDescription}
                                                                </td>
                                                                <td className="tx-right">
                                                                    {invoice.formattedAmount}
                                                                </td>
                                                                <td className="tx-right">
                                                                    {invoice.paid && (
                                                                        <strong className="tx-success">
                                                                            <FiCheck className="mr-1" />
                                                                            Paid
                                                                        </strong>
                                                                    )}
                                                                    {!invoice.paid && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-xs btn-outline-primary"
                                                                            onClick={
                                                                                this
                                                                                    .handleShowCreditCardModal
                                                                            }
                                                                        >
                                                                            <FiCreditCard className="mr-1" />
                                                                            <span className="d-none d-sm-inline">
                                                                                Pay Invoice
                                                                            </span>
                                                                        </button>
                                                                    )}
                                                                </td>
                                                                <td className="tx-right">
                                                                    {invoice.paid && (
                                                                        <a
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            href={invoice.pdfUrl}
                                                                            roll="button"
                                                                            className="btn btn-xs btn-outline-primary"
                                                                        >
                                                                            <FiDownload className="mr-1" />
                                                                            Download
                                                                        </a>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {billing.subscriptionStatus === "active" && !billing.subscriptionEndDate && (
                            <div className="row mg-t-20">
                                <div className="col-md-12 d-flex justify-content-between align-items-center">
                                    <div className="card card-body d-flex justify-content-between align-items-center flex-row">
                                        <h5 className="card-title mg-b-0">Cancel Subscription</h5>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={this.showCancelSubscription}
                                        >
                                            {!showSpinner.cancelSubscription && (
                                                <FiX className="mr-1" />
                                            )}
                                            {showSpinner.cancelSubscription && (
                                                <FaCircleNotch className="fa-spin mr-1" />
                                            )}
                                            Cancel Subscription
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <ModalConfirm
                    show={showConfirmModal}
                    onHide={this.handleCloseConfirmModal}
                    {...confirmModal}
                />
                {!billing.isFiller && (
                    <StripeProvider apiKey={billing.stripPublishableAPIKey}>
                        <Elements>
                            <ModalCreditCard
                                show={showCreditCardModal}
                                onHide={this.handleCloseCreditCardModal}
                                invoice={invoice}
                                onSuccess={this.handleCreditCardSuccess}
                                user={user}
                                error={errors.creditCard}
                            />
                        </Elements>
                    </StripeProvider>
                )}
            </div>
        );
    }
}

Billing.propTypes = {
    location: ReactRouterPropTypes.location.isRequired,
    user: PropTypes.shape({
        username: PropTypes.string
    }).isRequired,
    updateUser: PropTypes.func.isRequired
};

const ConnectedBilling = props => (
    <UserConsumer>
        {({user, updateUser}) => <Billing {...props} user={user} updateUser={updateUser} />}
    </UserConsumer>
);
export default withRouter(ConnectedBilling);
