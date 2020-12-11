import React from 'react';

import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import {UserContext} from "../admin/providers/UserProvider"
import AddAirbnbAccount from "../admin/components/AddAirbnbAccount";


describe('AddAirbnbAccount', () => {

    describe('Initial load', () => {

        it('Renders as a form', () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());
            expect(screen.getByRole('form')).toBeInTheDocument();
        })

    })

    describe('User has logged into Airbnb account', () => {

        beforeEach(async () => {
            jest.spyOn(window, 'fetch')
            window.fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({error: {id: "1", verificationMethods: ["1", "2"]}}),
            });

            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});
            fireEvent.change(screen.getByLabelText('Airbnb Password'), {target: {value: "password"}});

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.getByText('Verify Airbnb Account'))
            });
        })

        it('Renders as a form', async () => {

            expect(screen.getByRole('form')).toBeInTheDocument();

        })

    })

    // describe('Account verification code sent', () => {
    //
    //     it('Renders as a form', () => {
    //         renderAddAirbnbAccount(emptyAddAirbnbAccountProps());
    //         expect(screen.getByRole('form')).toBeInTheDocument();
    //     })
    //
    // })

})

function emptyAddAirbnbAccountProps() {
    return {
        onHide: () => {},
        hideCloseButtons: false,
        credentials: {
            airbnbUsername: "",
            airbnbPassword: "",
            recaptchaToken: ""}
    }
}

function renderAddAirbnbAccount(props) {
    let mockValue = jest.mock("../admin/providers/UserProvider", () => ({
        __esModule: true,
        default: React.createContext()
    }));

    return render(
        <UserContext.Provider value={mockValue}>
            <AddAirbnbAccount />
        </UserContext.Provider>
    );
}