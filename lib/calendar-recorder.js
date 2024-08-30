// lib/calendar-recorder.js
const { google } = require('googleapis');
const path = require('path');

class CalendarRecorder {
    constructor() {
        this.calendars = [];
        this.isRecording = false;
        this.activeEvents = new Set();
    }

    async init() {
        // Load configuration from Kap's settings
        this.config = {
            calendars: config.get('calendars') || [],
            outputDirectory: config.get('outputDirectory') || '~/Documents/KapRecordings',
            frameRate: config.get('frameRate') || 30,
            scale: config.get('scale') || 1
        };

        // Initialize calendars
        for (const calendarConfig of this.config.calendars) {
            const auth = new google.auth.OAuth2(
                calendarConfig.clientId,
                calendarConfig.clientSecret
            );
            auth.setCredentials({ refresh_token: calendarConfig.refreshToken });

            this.calendars.push({
                id: calendarConfig.id,
                calendar: google.calendar({ version: 'v3', auth })
            });
        }

        this.startEventChecking();
    }

    // ... [rest of the methods from the previous implementation]

    async stopRecording() {
        if (!this.isRecording) return;

        await kap.stopRecording();
        this.isRecording = false;
        this.activeEvents.clear();
        console.log('Stopped recording');
    }
}

module.exports = CalendarRecorder;