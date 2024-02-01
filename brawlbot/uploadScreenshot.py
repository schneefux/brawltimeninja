import pysftp
from datetime import datetime
from my_logging import my_print as print

cnopts = pysftp.CnOpts()
cnopts.hostkeys = None

def upload(pathToScript, screenshotFilename, ext="", dateString=""):
    """Uploads a .png to the brawltime.ninja server with a given filename and a date. If the date is not set, it will use the current date."""
    print('assining date string')
    now = datetime.now()
    if not dateString:
        dateString = now.strftime("%Y-%m-%d")
    print(dateString)
    print('getting key from', pathToScript+'brawlbot.key')
    try:
        connection = pysftp.Connection(host="", username="", private_key=pathToScript+'secretkey.key', port=2222, cnopts=cnopts)
        print('connection established')
        connection.put(pathToScript+screenshotFilename, "/competition-winners/"+dateString+ext+".png")
        print('image uploaded to', "/competition-winners/"+dateString+ext+".png")
        connection.close()
    except Exception as e:
        print(e)
        print('trying again... Are you connected to internet?')
        upload(pathToScript, screenshotFilename, ext, dateString)
        return "something went wrong"
    return 'image uploaded', "/competition-winners/"+dateString+ext+".png"

if __name__ == "__main__":
    import vars
    upload(vars.pathToScript, vars.cuttedscreenshotFilename)
