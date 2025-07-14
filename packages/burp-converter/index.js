/**
 * This is a demo plugin that takes the default click command, adds a new "customClick" command,
 * and replaces recordings of the default click command with the custom one.
 * This plugin also adds a hook that logs the command before it is executed.
 */
const plugin = {
    hooks: {
        onAfterCommand: (input) => {
            console.log('After record-event command', input);
        },
        onBeforeCommand: (input) => {
            console.log('Before record-event command', input);
        },
        async onLoad(api) {
            console.log('Loading record-event plugin!');
            api.channels.onSend.addListener((channel, command) => {
                if (channel === 'record-event') {
                    console.log('Message received', channel, command);
                }
            });
            console.log('Loaded record-event plugin!');
        },
    },
};
module.exports = plugin;
// # sourceMappingURL=index.js.map