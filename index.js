// index.js
const CalendarRecorder = require('./lib/calendar-recorder');

const calendarRecorder = new CalendarRecorder();

exports.willStartRecording = async () => {
    // This is called when Kap is about to start a recording
    // We don't need to do anything here as our plugin handles its own recording starts
};

exports.didStopRecording = async () => {
    // This is called when Kap stops a recording
    await calendarRecorder.stopRecording();
};

exports.didConfigChange = async () => {
    // This is called when the plugin's configuration changes
    await calendarRecorder.init();
};

// Initialize the plugin when it's loaded
calendarRecorder.init();