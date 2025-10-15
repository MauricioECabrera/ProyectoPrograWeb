from app import create_app

app = create_app()

with app.test_client() as c:
    resp = c.post('/auth/password/request-reset', json={'email':'test@anima.com'})
    print('status', resp.status_code)
    print('data', resp.get_json())
