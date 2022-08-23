# trudeplo
Trustworthy deployment for critical components on Edge devices

# Quickest start
One command to load the sample model and start uploading the device information every minute:

```npm start dt heartbeat```

The device information can be received at:

```mqtt sub -t 'trudeplo/device' -h 'test.mosquitto.org' -v```
