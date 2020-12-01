import {addDays, format, isToday, isTomorrow, isYesterday, subDays} from "date-fns";
import PropTypes from "prop-types";
import React, {Component} from "react";
import TagManager from "react-gtm-module";
import {FiChevronLeft, FiChevronRight} from "react-icons/fi";
import {withRouter} from "react-router-dom";

import {UserConsumer} from "../providers/UserProvider";

const Errors = React.lazy(() => import("./Errors"));

class Turnovers extends Component {
    state = {
        turnovers: [
            {
                isFiller: true,
                _id: "1",
                airbnbConfirmationCode: "1",
                airbnbThumbnailUrl:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAcAAA0ACbYD1v4AAAAASUVORK5CYII=",
                airbnbFirstName: " ",
                messageRuleTitle: " ",
                sendDate: new Date(),
                sentDateFormated: " ",
                message: "\n\n\n\n\n\n\n\n\n"
            },
            {
                isFiller: true,
                _id: "2",
                airbnbConfirmationCode: "2",
                airbnbThumbnailUrl:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAcAAA0ACbYD1v4AAAAASUVORK5CYII=",
                airbnbFirstName: " ",
                messageRuleTitle: " ",
                sendDate: new Date(),
                sentDateFormated: " ",
                message: "\n\n\n\n\n\n\n\n"
            },
            {
                isFiller: true,
                _id: "3",
                airbnbConfirmationCode: "3",
                airbnbThumbnailUrl:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAcAAA0ACbYD1v4AAAAASUVORK5CYII=",
                airbnbFirstName: " ",
                messageRuleTitle: " ",
                sendDate: new Date(),
                sentDateFormated: " ",
                message: "\n\n\n\n\n"
            },
            {
                isFiller: true,
                _id: "4",
                airbnbConfirmationCode: "4",
                airbnbThumbnailUrl:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAcAAA0ACbYD1v4AAAAASUVORK5CYII=",
                airbnbFirstName: " ",
                messageRuleTitle: " ",
                sendDate: new Date(),
                sentDateFormated: " ",
                message: "\n\n\n\n\n\n"
            }
        ],
        currentDate: new Date()
    };

    constructor(props) {
        super(props);
        this.getTurnovers = this.getTurnovers.bind(this);
        this.handleNextPage = this.handleNextPage.bind(this);
        this.handlePreviousPage = this.handlePreviousPage.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
    }

    async componentDidMount() {
        try {
            this.getTurnovers();

            const tagManagerArgs = {
                dataLayer: {
                    page: "Turnovers"
                }
            };
            TagManager.dataLayer(tagManagerArgs);
        } catch (error) {
            console.log("error: ", error);
        }
    }

    async onRefresh() {
        // const {updateUser} = this.props;
        // await updateUser();
        await this.getTurnovers();
    }

    async getTurnovers() {
        const {currentDate} = this.state;
        const api = `/getTurnovers/${format(currentDate, "yyyy-MM-dd")}`;
        const response = await fetch(api);
        if (response.ok) {
            const turnovers = await response.json();
            this.setState({turnovers});
        } else {
            console.log("response", response);
            window.location = "/admin";
        }
    }

    async handleNextPage() {
        try {
            let {currentDate} = this.state;
            currentDate = addDays(currentDate, 1);
            await this.setState({currentDate});
            this.getTurnovers();
        } catch (error) {
            console.log("error: ", error);
        }
    }

    async handlePreviousPage() {
        try {
            let {currentDate} = this.state;
            currentDate = subDays(currentDate, 1);
            await this.setState({currentDate});
            this.getTurnovers();
        } catch (error) {
            console.log("error: ", error);
        }
    }

    render() {
        const {turnovers, currentDate} = this.state;
        const {errors} = this.props;

        let dateFormat = "eee, MMMM do";
        let dateFormatMobile = "MMM do";
        if (isToday(currentDate)) {
            dateFormat = "'Today, 'MMMM do";
            dateFormatMobile = "'Today'";
        } else if (isTomorrow(currentDate)) {
            dateFormat = "'Tomorrow, 'MMMM do";
            dateFormatMobile = "'Tomorrow'";
        } else if (isYesterday(currentDate)) {
            dateFormat = "'Yesterday, 'MMMM do";
            dateFormatMobile = "'Yesterday'";
        }

        const printTurnovers = type => {
            let title = "Check-ins";
            let postTimeText = "Arrival";
            if (type === "checkout") {
                title = "Check-outs";
                postTimeText = "Departure";
            }
            return (
                <div className="row mt-3">
                    <div className="col-md-12 offset-lg-1 col-lg-10">
                        <h4 className="mt-3">{title}</h4>
                        <div className="row bd-b bd-1">
                            <div className="col-6 text-uppercase tx-11 font-weight-bold d-flex align-items-end">
                                Listing
                            </div>
                            <div className="col-2 text-uppercase tx-11 font-weight-bold d-flex align-items-end justify-content-end text-right">
                                Name
                            </div>
                            <div className="col-2 text-uppercase tx-11 font-weight-bold d-flex align-items-end justify-content-end text-right">
                                Guests
                            </div>
                            <div className="col-2 text-uppercase tx-11 font-weight-bold d-flex align-items-end justify-content-end text-right">
                                Same Day
                            </div>
                        </div>
                        {turnovers.length !== 0 &&
                            turnovers.map(turnover => {
                                if (turnover.isCheckOut && type === "checkin") {
                                    return;
                                }
                                if (turnover.isCheckIn && type === "checkout") {
                                    return;
                                }
                                if (turnover.isFiller) {
                                    return <div className="col-12" key={turnover._id} />;
                                }
                                let time = turnover.airbnbCheckInTime;
                                if (type === "checkout") {
                                    time = turnover.airbnbCheckOutTime;
                                }
                                let amPM = "am";
                                if (time >= 12) {
                                    amPM = "pm";
                                    if (time !== 12) {
                                        time -= 12;
                                    }
                                }
                                return (
                                    <div className="row pd-y-10 bd-t bd-1" key={turnover._id}>
                                        <div className="col-6 d-flex">
                                            <img
                                                className="mg-r-10 d-none d-sm-block"
                                                src={turnover.airbnbThumbnailUrl}
                                                alt={
                                                    turnover.nickname
                                                        ? turnover.nickname
                                                        : turnover.airbnbName
                                                }
                                                style={{
                                                    height: "50px"
                                                }}
                                            />
                                            <span className="d-flex justify-content-center flex-column text-break">
                                                {turnover.nickname
                                                    ? turnover.nickname
                                                    : turnover.airbnbName}
                                                <div className="text-muted tx-11">
                                                    {`${time}${amPM} ${postTimeText}`}
                                                </div>
                                            </span>
                                        </div>
                                        <div className="col-2 d-flex justify-content-end align-items-center">
                                            {turnover.airbnbFirstName}
                                        </div>
                                        <div className="col-2 d-flex justify-content-end align-items-center">
                                            {`${turnover.airbnbNumberOfGuests}`}
                                        </div>
                                        <div className="col-2 d-flex justify-content-end align-items-center">
                                            {turnover.isSameDayTurnover ? "Yes" : "No"}
                                        </div>
                                    </div>
                                );
                            })}
                        {turnovers.length === 0 && (
                            <div className="col-12 pd-30 text-muted text-center">
                                {type === "checkin" && "No check-ins today"}
                                {type === "checkout" && "No check-outs today"}
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        return (
            <div className="az-content">
                <div className="container">
                    <div className="az-content-body">
                        <React.Suspense fallback={<div />}>
                            <Errors errors={errors} onRefresh={this.onRefresh} />
                        </React.Suspense>
                        <div className="container">
                            <div className="az-content-body">
                                <div className="d-flex justify-content-between mb-3">
                                    <div>
                                        <div className="az-content-breadcrumb">
                                            <span>Home</span>
                                            <FiChevronRight />
                                            <span>Turnovers</span>
                                        </div>
                                        <h2 className="az-content-title mb-0">Turnovers</h2>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h4 className="mb-0 mg-r-20 d-none d-sm-block">
                                            {format(currentDate, dateFormat)}
                                        </h4>
                                        <div className="btn-group">
                                            <button
                                                type="button"
                                                className="btn btn-outline-dark"
                                                onClick={this.handlePreviousPage}
                                            >
                                                <FiChevronLeft />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-dark"
                                                onClick={this.handleNextPage}
                                            >
                                                <FiChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mt-3">
                                    <div className="col-md-12 offset-lg-1 col-lg-10">
                                        <h4 className="d-block d-sm-none text-center">
                                            {format(currentDate, dateFormatMobile)}
                                        </h4>
                                    </div>
                                </div>

                                {printTurnovers("checkout")}
                                {printTurnovers("checkin")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Turnovers.propTypes = {
    errors: PropTypes.shape({hasErrors: PropTypes.bool})
};

Turnovers.defaultProps = {
    errors: {hasErrors: false}
};

const ConnectedTurnovers = props => (
    <UserConsumer>
        {({user, errors}) => <Turnovers {...props} user={user} errors={errors} />}
    </UserConsumer>
);
export default withRouter(ConnectedTurnovers);
