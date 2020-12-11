import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from "../admin/components/ContactForm";

describe('ContactForm', () => {

    it('Renders as a form', () => {
        render(<ContactForm />);
        expect(screen.getByRole('form')).toBeInTheDocument();
    })

    it('Has no error messages on load', () => {
        render(<ContactForm />);

        expect(screen.queryByText('Missing name.')).not.toBeInTheDocument();
        expect(screen.queryByText('Missing email.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please enter a valid email.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please include me a message.')).not.toBeInTheDocument();
    })

    it('Requires a name', () => {
        render(<ContactForm />);

        fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'Test Email'}});
        fireEvent.change(screen.getByLabelText('Message'), {target: {value: 'Test Message'}});

        fireEvent.click(screen.getByText('Send Message'));

        expect(screen.queryByText('Missing name.')).toBeInTheDocument();

        expect(screen.queryByText('Missing email.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please include me a message.')).not.toBeInTheDocument();
    })

    it('Requires an email', () => {
        render(<ContactForm />);

        fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Test Name'}});
        fireEvent.change(screen.getByLabelText('Message'), {target: {value: 'Test Message'}});

        fireEvent.click(screen.getByText('Send Message'));

        expect(screen.queryByText('Missing email.')).toBeInTheDocument();

        expect(screen.queryByText('Missing name.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please include me a message.')).not.toBeInTheDocument();
    })

    it('Validates the email', () => {
        render(<ContactForm />);

        fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Test Name'}});
        fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'Test Email'}});
        fireEvent.change(screen.getByLabelText('Message'), {target: {value: 'Test Message'}});

        fireEvent.click(screen.getByText('Send Message'));

        expect(screen.queryByText('Please enter a valid email.')).toBeInTheDocument();

        expect(screen.queryByText('Missing name.')).not.toBeInTheDocument();
        expect(screen.queryByText('Missing email.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please include me a message.')).not.toBeInTheDocument();
    })

    it('Requires a message', () => {
        render(<ContactForm />);

        fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Test Name'}});
        fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'Test Email'}});

        fireEvent.click(screen.getByText('Send Message'));

        expect(screen.queryByText('Missing name.')).not.toBeInTheDocument();
        expect(screen.queryByText('Missing email.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please include me a message.')).toBeInTheDocument();
    })

    it('No error messages for completed form', () => {
        render(<ContactForm />);

        expect(screen.queryByText('Missing name.')).not.toBeInTheDocument();
        expect(screen.queryByText('Missing email.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please include me a message.')).not.toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Test Name'}});
        fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'testing@gmail.com'}});
        fireEvent.change(screen.getByLabelText('Message'), {target: {value: 'Test Message'}});

        fireEvent.click(screen.getByText('Send Message'));

        expect(screen.queryByText('Missing name.')).not.toBeInTheDocument();
        expect(screen.queryByText('Missing email.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please enter a valid email.')).not.toBeInTheDocument();
        expect(screen.queryByText('Please include me a message.')).not.toBeInTheDocument();
    })

    it('Does not make fetch call for incomplete form', () => {
        render(<ContactForm />);

        jest.spyOn(window, 'fetch')

        fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Test Name'}});
        fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'testing@gmail.com'}});

        fireEvent.click(screen.getByText('Send Message'));

        expect(window.fetch).toHaveBeenCalledTimes(0)
    })

    it('Makes fetch call for completed form', () => {
        render(<ContactForm />);

        jest.spyOn(window, 'fetch')
        window.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({success: true}),
        });

        let testName = 'Test Name';
        let testEmail = 'testing@gmail.com';
        let testMessage = 'Test Message';
        fireEvent.change(screen.getByLabelText('Name'), {target: {value: testName}});
        fireEvent.change(screen.getByLabelText('Email'), {target: {value: testEmail}});
        fireEvent.change(screen.getByLabelText('Message'), {target: {value: testMessage}});

        fireEvent.click(screen.getByText('Send Message'));

        expect(window.fetch).toHaveBeenCalledTimes(1)
        expect(window.fetch).toHaveBeenCalledWith(
            '/contactUs',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({name: testName, email: testEmail, message: testMessage}),
            }),
        )
    })
})