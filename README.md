# trudeplo
Trustworthy deployment for critical components on Edge  devices

This repo contains the adapters to different types of devices, and the local coordinator wrapping up the adapters. The fleet-level management based on the Ditto Digital Twin solution, together with a GUI, can be found in another repo [ditto-fleet](https://github.com/SINTEF-9012/ditto-fleet).

# Quickest start
One command to load the sample model and start uploading the device information every minute, and listen to updates from ditto-fleet:

```npm start dt all```

Without ditto, the reported device twins can be received here:

```mqtt sub -t 'trudeplo/device' -h 'test.mosquitto.org' -v```

To simulate the fleet management (e.g., installing agents), a mock up client can be used:

```npm start mqtt start```
