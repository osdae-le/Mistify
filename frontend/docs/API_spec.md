**API Specification** for Misting System

---

## **API Overview**

### Base URL: `/api\v1`

### **Authentication:**
- **API-TOKEN** is used for user authentication.
- The token must be included in the request header: `Authorization: Bearer <API-TOKEN>`

---

## **1. Authentication API (Xác thực người dùng)**

### **1.1. REGISTER**
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Description**:  Registers a new user.
- **Request Body**:
    ```json
    {
        "name": "string",
        "email": "string",
        "password": "string",
        "confirm_password": "string"
    }
    ```
- **Response**:
    - **201 Created**:
    ```json
    {
        "message": "User registered successfully",
        "user_id": "string"
    }
    ```
    - **400 Bad Request**:
    ```json
    {
        "error": "Invalid input",
        "details": {
            "email": "Invalid email format",
            "password": "Password must be at least 8 characters"
        }
    }
    ```
    - **409 Conflict**: 
    ```json
    {
        "error": "Email already exist",
    }
    ```

---

### **1.2. LOGIN**
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Description**: Authenticates a user by verifying their login credentials.
- **Request Body**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
- **Response**:
    - **200 OK**:
    ```json
    {
        "message": "Login successful",
        "token": "JWT-token"
    }
    ```
    - **401 Unauthorized**: 
    ```json
    {
        "error": "Incorrect login credentials",
    }
    ```

---

### **1.3. FORGOT PASSWORD**
- **Method**: `POST`
- **Endpoint**: `/auth/forgot-password`
- **Description**: Send mail to create new password.
- **Request Body**:
    ```json
    {
        "email": "string"
    }
    ```
- **Response**:
    - **200 OK**:
    ```json
    {
        "message": "Link reset password was sent to your email"
    }
    ```
- **404 Not Found**:
    ```json
    {
    "message": "Email does not exist in our system. Please try again."
    }
    ```

---

### **1.4. CHANGE PASSWORD**
- **Method**: `POST`
- **Endpoint**: `/auth/reset-password`
- **Description**: Allows the user to reset their password using a token from the reset link.
- **Authorization**: Bearer Token (JWT)
- **Request Body**:
    ```json
    {
        "current_password": "string",
        "new_password": "string",
        "confirm_new_password": "string"
    }
    ```
- **Response**:
    - **200 OK**:
    ```json
    {
        "message": "Password changed successfully"
    }
    ```
    - **400 Bad Request**:
    ```json
    {
        "error": "Password must be at least 8 characters"
    }
    ```
    - **401 Unauthorized**:
    ```json
    {
        "error": "Invalid or expired token."
    }
    ```
    - **403 Forbidden**: 
    ```json
    {
        "error": "Current password is incorrect."
    }
    ```
    ```json
    {
        "error": "New password cannot be the same as the old password."
    }
    ```


---
### **1.5. LOG OUT**
- **Method**: `POST`
- **Description**: Logs out the user by invalidating their session or JWT token.

- **Response**:
    - **200 OK**:
      ```json
      {
        "message": "Logout successful"
      }
      ```
---

## **2. DISPLAY DATA** (WEBSOCKET OR API RESPONSE PER SECOND)


### **2.1. Get temperature**
- **Protocol**: `Websocket`
- **Endpoint**: `/api/v1/data/temperature`
- **Description**: Retrieve the synthetic data about temperature.
- **Query Parameters**:
    - `NO`: No query parameters needed.
- **Response**:
    - **200 OK**:
    ```json
    {
        "type": "temperature",
        "current": 28,
        "difference": 2
    }
    ```
- **Access**:
    - **404 Not Found**: 
    ```json
    {
        "type": "error",
        "message": "Invalid request"
    }

---

### **2.2. Get humidity**
- **Protocol**: `Websocket`
- **Endpoint**: `/api/v1/data/humidity`
- **Description**: Retrieve the synthetic data about humidity.
- **Query Parameters**:
    - `NO`: No query parameters needed.
- **Response**:
    - **200 OK**:
    ```json
    {
        "type": "humidity",
        "current": 28,
        "difference": 2
    }
    ```
- **Access**:
    - **404 Not Found**: 
    ```json
    {
        "type": "error",
        "message": "Invalid request"
    }

---
### **2.3. Get brightness**
- **Protocol**: `Websocket`
- **Endpoint**: `/api/v1/data/brightness`
- **Description**: Retrieve the synthetic data about brightness.
- **Query Parameters**:
    - `NO`: No query parameters needed.
- **Response**:
    - **200 OK**:
    ```json
    {
        "type": "brightness",
        "current": 28,
        "difference": 2
    }
    ```
- **Access**:
    - **404 Not Found**: 
    ```json
    {
        "type": "error",
        "message": "Invalid request"
    }

---

### **2.5. Get data chart**




## **3. EVERYTHING ABOUT SETTING**

### **3.1. GET Status Misting**
- **Method**: `GET`
- **Endpoint**: `/api/v1/misting/status`
- **Description**: Get status of misting.
- **Response**:
    - **200 OK**:
    ```json
    {
        "manual_control": {
            "status": "off"
        },
        "scheduler_spraying": {
            "status": "off",
            "schedule": {
                "schedule_time_on": "18:00",
                "schedule_time_off": "19:00"
            }
        },
        "environment_auto": {
            "status": "off",
            "conditions": {
                "temperature_threshold": 30,
                "humidity_threshold": 50,
                "brightness_threshold": 200
            }
        },
        "ai_control": {
            "status": "off"
        }
    }
    ```

---

### **3.2. Update Misting Mode**
- **Method**: `POST`
- **Endpoint**: `/api/v1/misting/update-mode`
- **Description**: Manual control.
- **Authorization**: Bearer Token (JWT)
- **Request Body**:
    `Content-Type`: application/json
    ```json
    {   
        "mode": "manual_control",
        "status": "on"
    }
    ```
    or
    ```json
    {   
        "mode": "scheduler_spraying",
        "status": "on"
    }
    ```
    or
    ```json
    {   
        "mode": "environment_auto",
        "status": "on"
    }
    ```
    or
    ```json
    {   
        "mode": "ai_control",
        "status": "off"
    }
    ```

- **Response**:
    - **200 OK**:
    ```json
    {
        "message": "Mode updated successfully",
        "current_mode": "environment_auto",
        "status": "on"
    }
    ```
 
---

### **3.3. Set Scheduler**
- **Method**: `POST`
- **Endpoint**: `/api/v1/misting/set-schedule`
- **Description**: Set schedule.
- **Authorization**: Bearer Token (JWT)
- **Request Body**:
    `Content-Type`: application/json
    ```json
    {   
        "schedule_time_on": "18:00",
        "schedule_time_off": "19:00"
    }
    ```
- **Response**:
    - **200 OK**:
    ```json
    {
        "message": "Schedule set successfully",
    }
    ```

---
### **3.4. Config Enviroment**
- **Method**: `POST`
- **Endpoint**: `/api/v1/misting/config-enviroment`
- **Description**: config enviroment.
- **Authorization**: Bearer Token (JWT)
- **Request Body**:
    `Content-Type`: application/json
    ```json
    {
        "temperature_threshold": 30,
        "humidity_threshold": 50,
        "brightness_threshold": 200
    }
    ```
- **Response**:
    ```json
    {
        "message": "Environmental conditions updated successfully",
    }
    ```

---

**Documentation and Error Handling**
---
**Common Responses**

`200 OK`: Thao tác thành công.

`201 Created`: Tài nguyên được tạo thành công.

`204 No Content`: Thao tác thành công, không có nội dung trả về.

`400 Bad Request`: Dữ liệu không hợp lệ hoặc thiếu thông tin.

`401 Unauthorized`: Người dùng không được phép truy cập tài nguyên.

`404 Not Found`: Tài nguyên không tìm thấy.

`500 Internal Server Error`: Lỗi không xác định trên server.

**Security Considerations**

