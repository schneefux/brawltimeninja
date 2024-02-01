from notificationManager import send_message, get_updates, get_last_update_id
import http.client as httplib
import time
from replyCommands import commandDict
import replyCommands
import my_socket

def runCommand(update):
    """Runs commands based on the content of the message and it's type."""
    message = update["message"]
    chat_id = message["chat"]["id"]
    if 'text' in message:
        command = message["text"]
        if not '/' in command:
            replyCommands.reply__text(update, chat_id)
        elif '/help' == command:
            replyCommands.reply_help(update, chat_id)
        elif command in commandDict:
            function = 'replyCommands.reply_' + command[1:]
            eval(function)(update, chat_id)
        else:
            replyCommands.reply__command_not_found(update, chat_id)
    if 'document' in message:
        replyCommands.reply__document(update, chat_id)
    if 'photo' in message:
        replyCommands.reply__photo(update, chat_id)

def process_new_messages(updates):
    """Processes the new messages on their content."""
    for update in updates["result"]:
        try:
            runCommand(update)
        except Exception as e:
            try:
                send_message("oops, something went wrong\n" + str(e), update["message"]["chat"]["id"])
            except Exception as e:
                pass
def check_messages_loop():
    """Constantly checks for new messages for the telegram bot."""
    last_update_id = None
    while True:
        try:
            updates = get_updates(last_update_id)
            if len(updates["result"]) > 0:
                last_update_id = get_last_update_id(updates) + 1
                process_new_messages(updates)
            time.sleep(0.5)
        except Exception as e:
            pass
def wait_for_internet_connection():
    """Pauses the script until an internet connection is established."""
    while True:
        conn = httplib.HTTPConnection("www.google.com", timeout=5)
        try:
            conn.request("HEAD", "/")
            conn.close()
            return
        except:
            conn.close()

if my_socket.get_lock("notificationManagerLoop"):
    print('notificationManagerLoop is already running')
    exit()
wait_for_internet_connection()
print('start')
check_messages_loop()