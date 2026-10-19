
const taskEvents = require('./events');

taskEvents.on('task-created', (task) => {
    setTimeout(() => {
        try {
            console.log(
                `[Notification] Task "${task.title}" created at ${new Date().toISOString()}`
            );
            console.log(`[Notification] Assigned user: ${task.userId || 'Not specified'}`);
        } catch (error) {
            taskEvents.emit('task-notification-error', error);
        }
    }, 2000);
});

taskEvents.on('task-deleted', (task) => {
    console.log(
        `[Notification] Task "${task.title}" deleted at ${new Date().toISOString()}`
    );
});

taskEvents.on('task-notification-error', (error) => {
    console.error('[Notification Error]', error.message);
});
