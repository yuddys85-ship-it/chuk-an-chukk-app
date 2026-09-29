export default async function handler(req, res) {
  // Hanya menerima POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    // Ambil Bearer token dari header
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access token tidak ditemukan"
      });
    }

    const accessToken = authorization.replace("Bearer ", "").trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: "Access token kosong"
      });
    }

    // Verifikasi langsung ke Pi Platform API
    const piResponse = await fetch(
      "https://api.minepi.com/v2/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );

    const piData = await piResponse.json();

    // Token tidak valid
    if (!piResponse.ok) {
      console.error("Pi verification failed:", piData);

      return res.status(401).json({
        success: false,
        error: "Token Pi tidak valid",
        piStatus: piResponse.status
      });
    }

    // UID dari /v2/me adalah UID yang sudah diverifikasi Pi
    return res.status(200).json({
      success: true,
      user: {
        uid: piData.uid,
        username: piData.username
      }
    });

  } catch (error) {
    console.error("Verify error:", error);

    return res.status(500).json({
      success: false,
      error: "Gagal menghubungi Pi Network"
    });
  }
}
