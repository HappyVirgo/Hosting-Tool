import React from "react";
import {Link, withRouter} from "react-router-dom";

// import {HashLink} from "react-router-hash-link";

const Footer = (props, context) => {
    return (
        <div className="az-footer">
            <div className="container">
                <span>&copy; 2020 Host Tools</span>
                <span>
                    <a className="text-muted" href="/PrivacyPolicy">
                        Privacy Policy
                    </a>
                    <a className="text-muted ml-3" href="/TermsOfUse">
                        Terms Of Use
                    </a>
                </span>
            </div>
        </div>
    );
};
export default withRouter(Footer);
