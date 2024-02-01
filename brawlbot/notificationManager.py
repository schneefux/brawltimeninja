import requests
import json
import urllib
import vars
import screenshotCutter
import uploadScreenshot
import configs
from my_logging import my_print as print

TOKEN = ''
URL = "https://api.telegram.org/bot{}/".format(TOKEN)

def broadcast_to_subscribers(message=None, photoPath=None):
    """Sends a text message to all subscribers in the config.config."""
    config = configs.load_config()
    for id in config.subscribers:
        if not message is None:
            send_message(message, id)
        if not photoPath is None:
            try:
                send_photo(photoPath, id)
            except:
                send_message('photo could not be sent ' + photoPath, id)

def send_photo(pathToImage, chat_id):
    url = URL + "sendPhoto?chat_id={}".format(chat_id)
    files = {"photo": open(pathToImage, 'rb')}
    post_url(url=url, files=files)

def get_url(url):
    response = requests.get(url)
    content = response.content.decode("utf8")
    return content
def post_url(url, files=None, data=None, params=None):
    """Makes a post request to the telegram bot to send files."""
    response = requests.post(url, files=files, data=data, params=params)
    content = response.content.decode("utf8")
    return content

def get_json_from_url(url):
    """Returns the repsonse of the url get request in a json format."""
    content = get_url(url)
    js = json.loads(content)
    return js

def get_updates(offset=None):
    """Gets all messages that haven't been processed yet."""
    url = URL + "getUpdates?timeout=100"
    if offset:
        url += "&offset={}".format(offset)
    js = get_json_from_url(url)
    return js

def send_message(text, chat_id):
    """Sends a message to the given chat"""
    text = urllib.parse.quote_plus(text)
    url = URL + "sendMessage?text={}&chat_id={}".format(text, chat_id)
    get_url(url)

def send_message_to_admins(text):
    """Sends a message to all admins in the config.config."""
    config = configs.load_config()
    admins = []
    for id in config.subscribers:
        user = configs.load_user_config(id)
        if user.is_admin():
            admins.append(id)
    for id in admins:
        send_message(text, id)
def get_last_update_id(updates):
    """Gets the id of the last message."""
    update_ids = []
    for update in updates["result"]:
        update_ids.append(int(update["update_id"]))
    return max(update_ids)

def download_file(file_id, save_path):
    """Downloads a file from the telegram bot with the given file_id to the given save_path."""
    url = URL + "getFile?file_id=" + file_id
    result = get_json_from_url(url)
    file_path = result["result"]["file_path"]
    url = 'https://api.telegram.org/file/bot{}/{}'.format(TOKEN, file_path)
    urllib.request.urlretrieve(url, save_path)
