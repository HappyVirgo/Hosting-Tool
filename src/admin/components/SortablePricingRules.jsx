import arrayMove from "array-move";
import classNames from "classnames";
import PropTypes from "prop-types";
import React, {useState, useEffect} from "react";
import {Button, Dropdown} from "react-bootstrap";
import {FaCircleNotch} from "react-icons/fa";
import {FiChevronDown, FiEdit2, FiMenu, FiPause, FiPlay, FiPlus, FiTrash2} from "react-icons/fi";
import {SortableContainer, SortableElement, sortableHandle} from "react-sortable-hoc";

import {pricingRulesType} from "../types";

const DragHandle = sortableHandle(() => (
    <div className="c-pointer">
        <FiMenu className="mr-2" />
    </div>
));

const SortableItem = SortableElement(props => {
    const {
        pricingRule,
        showSpinner,
        onEditPricingRule,
        onDeletePricingRule,
        onPausePricingRule
    } = props;
    const pricingRuleClasses = classNames("list-group-item d-flex align-items-center pl-2", {
        "bg-light": pricingRule.paused
    });
    const actionButtonClasses = classNames("btn btn-xs", {
        "btn-outline-danger": pricingRule.paused,
        "btn-outline-primary": !pricingRule.paused
    });
    return (
        <li
            className={pricingRuleClasses}
            dnd-draggable="pricingRule"
            dnd-moved="pricingRules.splice($index, 1)"
        >
            <DragHandle />
            <div className="d-flex flex-grow-1 align-items-center justify-content-between">
                <span className="mr-2">{pricingRule.title}</span>
                <Dropdown alignRight>
                    <Dropdown.Toggle
                        variant="none"
                        className={actionButtonClasses}
                        disabled={pricingRule.isFiller}
                    >
                        {showSpinner && <FaCircleNotch className="fa-spin mr-1" />}
                        {pricingRule.paused && "Paused"}
                        {!pricingRule.paused && "Actions"}
                        <FiChevronDown className="ml-1" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            as={Button}
                            onClick={() => {
                                onEditPricingRule(pricingRule);
                            }}
                        >
                            <FiEdit2 className="mr-1" />
                            Edit
                        </Dropdown.Item>
                        {!pricingRule.paused && (
                            <Dropdown.Item
                                as={Button}
                                onClick={() => onPausePricingRule(pricingRule)}
                            >
                                <FiPause className="mr-1" />
                                Pause
                            </Dropdown.Item>
                        )}
                        {pricingRule.paused && (
                            <Dropdown.Item
                                as={Button}
                                onClick={() => onPausePricingRule(pricingRule)}
                            >
                                <FiPlay className="mr-1" />
                                Enable
                            </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Item
                            as={Button}
                            onClick={() => onDeletePricingRule(pricingRule)}
                            className="text-danger"
                        >
                            <FiTrash2 className="mr-1" />
                            Delete
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </li>
    );
});

const SortableList = SortableContainer(props => {
    const {pricingRules, onEditPricingRule, onDeletePricingRule, onPausePricingRule} = props;
    return (
        <ul className="list-group" dnd-list="pricingRules" id="dragable">
            {pricingRules.map((pricingRule, index) => (
                <SortableItem
                    key={pricingRule._id}
                    index={index}
                    pricingRule={pricingRule}
                    onEditPricingRule={onEditPricingRule}
                    onDeletePricingRule={onDeletePricingRule}
                    onPausePricingRule={onPausePricingRule}
                />
            ))}
            {pricingRules.length === 0 && (
                <li
                    className="list-group-item d-flex align-items-center justify-content-between"
                    ng-hide="pricingRules.length"
                >
                    No pricing rules have been added
                    <button
                        type="button"
                        className="btn btn-xs btn-outline-success"
                        onClick={onEditPricingRule}
                    >
                        <FiPlus className="mr-1" />
                        Add Rule
                    </button>
                </li>
            )}
        </ul>
    );
});

function SortablePricingRules(props) {
    const {
        pricingRules,
        airbnbUserID,
        airbnbListingID,
        onReorderPricing,
        onEditPricingRule,
        onDeletePricingRule,
        onPausePricingRule
    } = props;

    const [reorderedPricingRules, setReorderedPricingRules] = useState(pricingRules);

    useEffect(() => {
        setReorderedPricingRules(pricingRules);
    }, [pricingRules]);

    function onSortEnd({oldIndex, newIndex}) {
        const newPricingRules = arrayMove(pricingRules, oldIndex, newIndex);
        setReorderedPricingRules(newPricingRules);
        reorderPricing(newPricingRules);
    }

    async function reorderPricing(pricingRules) {
        try {
            const pricingOrder = pricingRules.reduce((result, rule) => {
                result.push(rule._id);
                return result;
            }, []);
            const url = "/reorderPricing";
            const fields = {
                pricingOrder,
                airbnbUserID,
                airbnbListingID
            };
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fields)
            });
            if (response.ok) {
                onReorderPricing();
            } else {
                console.error("response", response);
                window.location = "/";
            }
        } catch (error) {
            console.error("error", error);
        }
    }

    return (
        <SortableList
            pricingRules={reorderedPricingRules}
            onSortEnd={onSortEnd}
            onEditPricingRule={onEditPricingRule}
            onDeletePricingRule={onDeletePricingRule}
            onPausePricingRule={onPausePricingRule}
            useDragHandle
        />
    );
}

SortablePricingRules.propTypes = {
    airbnbUserID: PropTypes.string.isRequired,
    airbnbListingID: PropTypes.string.isRequired,
    pricingRules: pricingRulesType.isRequired,
    onEditPricingRule: PropTypes.func.isRequired,
    onDeletePricingRule: PropTypes.func.isRequired,
    onPausePricingRule: PropTypes.func.isRequired,
    onReorderPricing: PropTypes.func.isRequired
};

export default SortablePricingRules;
