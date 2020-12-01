/* eslint-disable react/no-danger */
import React, {Component} from "react";
import TagManager from "react-gtm-module";
import {FiChevronRight} from "react-icons/fi";

import listingDisable from "../img/faq/listingDisable.png";
import messageRuleModalEmailSMS from "../img/faq/messageRuleModalEmailSMS.png";
import pricingRuleReorder from "../img/faq/pricingRuleReorder.png";

class FAQ extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const tagManagerArgs = {
            dataLayer: {
                page: "FAQ"
            }
        };
        TagManager.dataLayer(tagManagerArgs);
    }

    render() {
        const sections = [
            {title: "Messaging", category: "messaging"},
            {title: "Pricing", category: "pricing"},
            {title: "Listings", category: "listings"},
            {title: "Billing", category: "billing"}
        ];
        const panels = [
            // Messaging
            {
                id: "m1",
                category: "messaging",
                title: "What is a message rule?",
                body: [
                    {
                        text:
                            "A message rule is a set of criteria that is used to determine if and when to send a guest a message."
                    }
                ]
            },
            {
                id: "m2",
                category: "messaging",
                title: "What is the 'All Listings' section under the 'Messaging' menu?",
                body: [
                    {
                        text:
                            "If you have more than one listing you will have the 'All Listings' section under the 'Messaging' menu.  If you create a message rule in the 'All Listings' section it will apply that message rule to all guests in all listings."
                    }
                ]
            },
            {
                id: "m3",
                category: "messaging",
                title:
                    "How do I create a message rule to send messages to my cleaners via email or SMS?",
                body: [
                    {
                        text:
                            "In addition to sending messages to guests though Airbnb's messaging platform you can also send automated email or SMS messages.  This is often used to let the cleaners know that you just got a new booking or to remind them a day or two before they need to clean."
                    },
                    {
                        text:
                            "When creating a message rule, simply select the 'Send as an email' or the 'Send as an SMS' option and enter the email or phone number you would like to send the message to."
                    },
                    {img: messageRuleModalEmailSMS, alt: "Message rule modal email or SMS"}
                ]
            },
            {
                id: "m4",
                category: "messaging",
                title: "What are the message tags for?",
                body: [
                    {
                        text:
                            "Message tags allow you to include guest specific text in your messages.  For example, you can insert the guest's first name by putting the {{Guest First Name}} where you want their first name.  Not sure if you're using the tags correctly?  After saving your message rule, go to the dashboard to see what the actual message will look like for each guest."
                    }
                ]
            },
            {
                id: "m5",
                category: "messaging",
                title: "How do I change the format of the date and/or time tags?",
                body: [
                    {
                        text:
                            "You can change the format of the {{Check-In Date}}, {{Check-In Time}}, {{Check-Out Date}} and {{Check-Out Time}}.  To change the format, add a '|' symbol and then add tokens to get the desired output format.  Use the below formatting table find the code combination to meet your needs."
                    },
                    {
                        text:
                            "Here's an example how you might change the output format of the check-in date.  If you want it to read: 'January 1st 2017' you would use the '{{Check-In Date|MMMM Do, YYYY}}'.  If you need help with this feel free to send me a message with the format you would like and I can help you find set of codes."
                    },
                    {
                        class: "col-xsm-12 col-sm-offset-2 col-sm-8",
                        html:
                            "<table class='table table-striped table-bordered'>" +
                            "    <tbody>" +
                            "        <tr>" +
                            "            <th></th>" +
                            "            <th>Token</th>" +
                            "            <th>Output</th>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Example</b></td>" +
                            "            <td>YYYY-MM-DD</td>" +
                            "            <td>2014-01-01</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>dddd, MMMM Do YYYY</td>" +
                            "            <td>Friday, May 16th 2014</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>hh:mm a</td>" +
                            "            <td>12:30 pm</td>" +
                            "        </tr>" +
                            "    </tbody>" +
                            "</table>"
                    },
                    {
                        class: "col-xsm-12 col-sm-offset-2 col-sm-8",
                        html:
                            "<table class='table table-striped table-bordered horizontal-scroll'>" +
                            "    <tbody>" +
                            "        <tr>" +
                            "        <th></th>" +
                            "        <th>Token</th>" +
                            "        <th>Output</th>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Month</b></td>" +
                            "            <td>M</td>" +
                            "            <td>1 2 ... 11 12</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>Mo</td>" +
                            "            <td>1st 2nd ... 11th 12th</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>MM</td>" +
                            "            <td>01 02 ... 11 12</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>MMM</td>" +
                            "            <td>Jan Feb ... Nov Dec</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>MMMM</td>" +
                            "            <td>January February ... November December</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Quarter</b></td>" +
                            "            <td>Q</td>" +
                            "            <td>1 2 3 4</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>Qo</td>" +
                            "            <td>1st 2nd 3rd 4th</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Day of Month</b></td>" +
                            "            <td>D</td>" +
                            "            <td>1 2 ... 30 31</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>Do</td>" +
                            "            <td>1st 2nd ... 30th 31st</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>DD</td>" +
                            "            <td>01 02 ... 30 31</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Day of Year</b></td>" +
                            "            <td>DDD</td>" +
                            "            <td>1 2 ... 364 365</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>DDDo</td>" +
                            "            <td>1st 2nd ... 364th 365th</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>DDDD</td>" +
                            "            <td>001 002 ... 364 365</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Day of Week</b></td>" +
                            "            <td>d</td>" +
                            "            <td>0 1 ... 5 6</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>do</td>" +
                            "            <td>0th 1st ... 5th 6th</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>dd</td>" +
                            "            <td>Su Mo ... Fr Sa</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>ddd</td>" +
                            "            <td>Sun Mon ... Fri Sat</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>dddd</td>" +
                            "            <td>Sunday Monday ... Friday Saturday</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Day of Week (Locale)</b></td>" +
                            "            <td>e</td>" +
                            "            <td>0 1 ... 5 6</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Day of Week (ISO)</b></td>" +
                            "            <td>E</td>" +
                            "            <td>1 2 ... 6 7</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Week of Year</b></td>" +
                            "            <td>w</td>" +
                            "            <td>1 2 ... 52 53</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>wo</td>" +
                            "            <td>1st 2nd ... 52nd 53rd</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>ww</td>" +
                            "            <td>01 02 ... 52 53</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Week of Year (ISO)</b></td>" +
                            "            <td>W</td>" +
                            "            <td>1 2 ... 52 53</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>Wo</td>" +
                            "            <td>1st 2nd ... 52nd 53rd</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>WW</td>" +
                            "            <td>01 02 ... 52 53</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Year</b></td>" +
                            "            <td>YY</td>" +
                            "            <td>70 71 ... 29 30</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>YYYY</td>" +
                            "            <td>1970 1971 ... 2029 2030</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>Y</td>" +
                            "            <td>1970 1971 ... 9999 +10000 +10001<br /><b>Note:</b> This complies with the ISO 8601 standard for dates past the year 9999" +
                            "        </td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Week Year</b></td>" +
                            "            <td>gg</td>" +
                            "            <td>70 71 ... 29 30</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>gggg</td>" +
                            "            <td>1970 1971 ... 2029 2030</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Week Year (ISO)</b></td>" +
                            "            <td>GG</td>" +
                            "            <td>70 71 ... 29 30</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>GGGG</td>" +
                            "            <td>1970 1971 ... 2029 2030</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>AM/PM</b></td>" +
                            "            <td>A</td>" +
                            "            <td>AM PM</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>a</td>" +
                            "            <td>am pm</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Hour</b></td>" +
                            "            <td>H</td>" +
                            "            <td>0 1 ... 22 23</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>HH</td>" +
                            "            <td>00 01 ... 22 23</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>h</td>" +
                            "            <td>1 2 ... 11 12</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>hh</td>" +
                            "            <td>01 02 ... 11 12</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>k</td>" +
                            "            <td>1 2 ... 23 24</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>kk</td>" +
                            "            <td>01 02 ... 23 24</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Minute</b></td>" +
                            "            <td>m</td>" +
                            "            <td>0 1 ... 58 59</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>mm</td>" +
                            "            <td>00 01 ... 58 59</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Second</b></td>" +
                            "            <td>s</td>" +
                            "            <td>0 1 ... 58 59</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>ss</td>" +
                            "            <td>00 01 ... 58 59</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Fractional Second</b></td>" +
                            "            <td>S</td>" +
                            "            <td>0 1 ... 8 9</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>SS</td>" +
                            "            <td>00 01 ... 98 99</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>SSS</td>" +
                            "            <td>000 001 ... 998 999</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>SSSS ... SSSSSSSSS</td>" +
                            "            <td>000[0..] 001[0..] ... 998[0..] 999[0..]</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Time Zone</b></td>" +
                            "            <td>z or zz</td>" +
                            "            <td>EST CST ... MST PST<br/><b>Note:</b> as of <b>1.6.0</b>, the z/zz format tokens have been deprecated from plain moment objects. <a href='https://github.com/moment/moment/issues/162'>Read more about it here.</a> However, they *do* work if you are using a specific time zone with the moment-timezone addon.</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>Z</td>" +
                            "            <td>-07:00 -06:00 ... +06:00 +07:00</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td></td>" +
                            "            <td>ZZ</td>" +
                            "            <td>-0700 -0600 ... +0600 +0700</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Unix Timestamp</b></td>" +
                            "            <td>X</td>" +
                            "            <td>1360013296</td>" +
                            "        </tr>" +
                            "        <tr>" +
                            "            <td><b>Unix Millisecond Timestamp</b></td>" +
                            "            <td>x</td>" +
                            "            <td>1360013296123</td>" +
                            "        </tr>" +
                            "    </tbody>" +
                            "</table>"
                    }
                ]
            },

            // Pricing
            {
                id: "p1",
                category: "pricing",
                title:
                    "What does the 'Floating Period of Days' selection do under the 'Rule Types' section?",
                body: [
                    {
                        text:
                            "A floating period of days is a range of days that are always calculated a specified number of to from today for a specified number of days.  For example, if you want to set a pricing rule for the next week, set the 'When to Begin Floating Period' field to 0 (today) and the 'For How Many Days' field to 7 (one week)."
                    }
                ]
            },
            {
                id: "p2",
                category: "pricing",
                title:
                    "What does the 'Orphan Periods Between Bookings' selection do under the 'Rule Types' section?",
                body: [
                    {
                        text:
                            "An orphan period is a period of days between two reservations.  This is typically used to discount a short period of times between two reservations in the middle of the week because it's often more difficult to book."
                    }
                ]
            },
            {
                id: "p3",
                category: "pricing",
                title:
                    "What does the 'Specific Dates' selection do under the 'Rule Types' section?",
                body: [
                    {
                        text:
                            "The specific date selection allows you to set the prices of a specific date or date range.  This is useful for increasing prices for a local event or over a holiday."
                    }
                ]
            },
            {
                id: "p4",
                category: "pricing",
                title: "How can I see how a given day's price is calculated?",
                body: [
                    {
                        text:
                            "You can see all the calculations that go into a given day's calculated price by clicking on that day on the calendar.  A section below the date will open showing each calculation in the order they are calculated."
                    }
                ]
            },
            {
                id: "p5",
                category: "pricing",
                title: "How do I change the order in which the pricing rules are applied?",
                body: [
                    {
                        text:
                            "When on the pricing page with the calendar there is a list of all the rules you've added for the listing.  To change the order of the rules, click the icon of the three stacked horizontal lines and drag the rule to the location you want it."
                    },
                    {img: pricingRuleReorder, alt: "Pricing rule reorder"}
                ]
            },
            {
                id: "p6",
                category: "pricing",
                title:
                    "Does Host Tools pricing tool take market factors such as the type and location of your listing, the season, demand, etc?",
                body: [
                    {
                        text:
                            "Yes, the pricing tool uses your listing's Airbnb Smart Pricing data as it's base and then allows you to apply pricing rules on top of or using those prices.  Airbnb calculates your Smart Pricing by taking demand, availability, seasons and more into consideration.  With Host Tools, you can take your listing's Smart Price and make sure it's above a minimum or you can increase it by a percentage, the options are limitless.  Host Tool's pricing tool gives you full control over your prices."
                    },
                    {img: pricingRuleReorder, alt: "Pricing rule reorder"}
                ]
            },
            {
                id: "p6",
                category: "pricing",
                title: "Do I need to enable or disable Smart Pricing on Airbnb.com?",
                body: [
                    {
                        text:
                            "It doesn't make a difference, Host Tools is able to download the Smart Pricing data either way and will overwrite any prices set on Airbnb."
                    }
                ]
            },
            // Listings
            {
                id: "l1",
                category: "listings",
                title: "Is it possible to disable some listings?",
                body: [
                    {
                        text:
                            "You can disable a listing so that you're not charged for it or so that no messages are sent to it including any messages generated from the 'All Listings' messages section."
                    },
                    {
                        text:
                            "To disable a listing, browse to settings page by clicking the drop-down in the top right corner of the page and then selecting 'Settings'.  From the settings page click the 'Settings' button next to the listing you would like to disable."
                    },
                    {
                        text:
                            "Uncheck the 'Enable use of automated messages and pricing tools' checkbox and click 'Save'"
                    },
                    {img: listingDisable, alt: "Disable listing"}
                ]
            },
            {
                id: "l2",
                category: "listings",
                title: "How do I link Airbnb and VRBO listings?",
                body: [
                    {
                        text:
                            "You can link a listing by going to the Settings page, click on the 'Settings' link next to one of the listings and then add the linking you would like to link to it in the 'Link Listings' section then click save."
                    },
                    {
                        text:
                            "When you link a listing, Host Tools will ignore any message rules from the child listing and only use message rules from the parent listing.  If you already have message rules associated with an existing listing, make sure you link the new listing (child listing) to the existing listing (parent listing) by linking from the existing listing's settings window. Otherwise, you will not see your message rules."
                    },
                    {
                        text:
                            "Availability syncing is disabled by default.  If you want to sync availability between the listings, you must enable it on the listing's settings window."
                    },
                    {
                        text:
                            "Linked listings will count as one listing for billing purposes.  You will only be charged for one listing when you link listings together."
                    }
                ]
            }
        ];
        const toc = sections.map(section => {
            let filteredPanels = panels.filter(panel => {
                return panel.category === section.category;
            });
            if (filteredPanels.length === 0) {
                return false;
            }

            filteredPanels = filteredPanels.map(panel => {
                return (
                    <a href={`#${panel.id}`} className="list-group-item list-group-item-action">
                        {panel.title}
                    </a>
                );
            });

            return (
                <div
                    className="col-md-12 offset-lg-1 col-lg-10 mg-b-30"
                    key={`toc${section.category}`}
                >
                    <h2 className="az-content-title mg-b-30">{section.title}</h2>
                    <div className="list-group">{filteredPanels}</div>
                </div>
            );
        });

        const faqs = sections.map(section => {
            let filteredPanels = panels.filter(panel => {
                return panel.category === section.category;
            });
            if (filteredPanels.length === 0) {
                return false;
            }

            filteredPanels = filteredPanels.map(panel => {
                const body = panel.body.map((text, index) => (
                    <div key={panel.id + index} className="mg-b-20 pd-l-20">
                        {!!text.text && <p className="mg-b-20">{text.text}</p>}
                        {!!text.img && (
                            <img className="img-fluid bd mg-b-20" alt={text.alt} src={text.img} />
                        )}
                        {!!text.html && (
                            <div
                                className="mg-b-20"
                                dangerouslySetInnerHTML={{__html: text.html}}
                            />
                        )}
                    </div>
                ));
                return (
                    <div id={panel.id} key={panel.id} className="mg-l-20 mg-b-20">
                        <div className="az-content-label mg-b-20">{panel.title}</div>
                        {body}
                    </div>
                );
            });

            return (
                <div className="col-md-12 offset-lg-1 col-lg-10 mg-b-30" key={section.category}>
                    <h2 className="az-content-title">{section.title}</h2>
                    {filteredPanels}
                </div>
            );
        });

        return (
            <div className="az-content">
                <div className="container">
                    <div className="az-content-body">
                        <div className="d-flex justify-content-between mb-3">
                            <div>
                                <div className="az-content-breadcrumb">
                                    <span>Home</span>
                                    <FiChevronRight />
                                    <span>F.A.Q.</span>
                                </div>
                                <h2 className="az-content-title mb-0">
                                    Frequently Asked Questions
                                </h2>
                            </div>
                        </div>

                        <div className="row mg-t-50 mg-b-50">{toc}</div>
                        <div className="row mg-t-50">{faqs}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FAQ;
