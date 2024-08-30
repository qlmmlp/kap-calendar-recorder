// lib/calendar-recorder.js
const { google } = require('googleapis');
const path = require('path');

class CalendarRecorder {
    constructor() {
        this.calendars = [];
        this.isRecording = false;
        this.activeEvents = new Set();
        this.config = null;
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

    async getUpcomingEvents(calendar, timeMin, timeMax) {
        try {
            const events = await calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            return events.data.items;
        } catch (error) {
            console.error(`Error fetching events: ${error.message}`);
            return [];
        }
    }

    async startRecording() {
        if (this.isRecording) return;

        const filename = `KapRecording_${new Date().toISOString().replace(/:/g, '-')}.mp4`;
        const filePath = path.join(this.config.outputDirectory, filename);

        try {
            await kap.startRecording({
                fps: this.config.frameRate,
                scale: this.config.scale,
                audioDeviceId: 'default',
                videoCodec: 'h264',
                audioCodec: 'aac',
                displayId: 'main',
                filePath: filePath,
            });

            this.isRecording = true;
            console.log(`Started recording: ${filePath}`);
        } catch (error) {
            console.error(`Error starting recording: ${error.message}`);
        }
    }

    async stopRecording() {
        if (!this.isRecording) return;

        try {
            await kap.stopRecording();
            this.isRecording = false;
            this.activeEvents.clear();
            console.log('Stopped recording');
        } catch (error) {
            console.error(`Error stopping recording: ${error.message}`);
        }
    }

    async checkAndHandleEvents() {
        const now = new Date();
        const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

        for (const { calendar } of this.calendars) {
            try {
                const events = await this.getUpcomingEvents(calendar, now, tenMinutesFromNow);

                for (const event of events) {
                    const start = new Date(event.start.dateTime || event.start.date);
                    const end = new Date(event.end.dateTime || event.end.date);

                    if (now >= start && now < end) {
                        if (!this.isRecording) {
                            await this.startRecording();
                        }
                        this.activeEvents.add(event.id);
                    } else if (now >= end) {
                        this.activeEvents.delete(event.id);
                    }
                }
            } catch (error) {
                console.error(`Error checking events: ${error.message}`);
            }
        }

        // If there are no active events and we're recording, we don't stop automatically
        // The user will stop the recording manually
    }

    startEventChecking() {
        setInterval(() => this.checkAndHandleEvents(), 60000); // Check every minute
    }
}

module.exports = CalendarRecorder;