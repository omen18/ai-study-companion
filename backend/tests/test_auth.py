def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_register_and_login(client):
    email = "alice@example.com"
    r = client.post(
        "/auth/register",
        json={"email": email, "username": "alice", "password": "password1"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email

    # Duplicate should fail
    r2 = client.post(
        "/auth/register",
        json={"email": email, "username": "alice", "password": "password1"},
    )
    assert r2.status_code == 400

    # Login flow
    r3 = client.post(
        "/auth/login", data={"username": email, "password": "password1"}
    )
    assert r3.status_code == 200
    assert "access_token" in r3.json()


def test_protected_requires_auth(client):
    r = client.get("/notes")
    assert r.status_code == 401
