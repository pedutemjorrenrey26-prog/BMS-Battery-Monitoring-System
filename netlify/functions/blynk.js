
export default async (request, context) => {
  const token = process.env.BLYNK_AUTH_TOKEN;

  if (!token) {
    return Response.json(
      { connected: false, error: "BLYNK_AUTH_TOKEN is not configured." },
      { status: 500 }
    );
  }

  const base = "https://blynk.cloud/external/api/";
  const getValue = async (pin) => {
    const url = new URL("get", base);
    url.searchParams.set("token", token);
    url.searchParams.set(pin, "");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blynk request failed for ${pin}`);
    }

    return (await response.text()).trim();
  };

  try {
    const [voltage, temperature, soc, condition, onlineResponse] =
      await Promise.all([
        getValue("V0"),
        getValue("V1"),
        getValue("V2"),
        getValue("V3"),
        fetch(
          `${base}isHardwareConnected?token=${encodeURIComponent(token)}`
        ),
      ]);

    if (!onlineResponse.ok) {
      throw new Error("Could not check device connection.");
    }

    const onlineText = (await onlineResponse.text()).trim().toLowerCase();
    const connected = onlineText === "true";

    return Response.json({
      connected,
      voltage: Number(voltage),
      temperature: Number(temperature),
      soc: Number(soc),
      condition,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      {
        connected: false,
        error: "Could not retrieve live readings from Blynk.",
      },
      { status: 502 }
    );
  }
};
