import grpc
from . import auth_pb2
from . import auth_pb2_grpc
import os

class AuthGrpcClient:
    def __init__(self) -> None:
        target_host = os.getenv("AUTH_SERVICE_HOST", "users-auth")
        target_port = os.getenv("AUTH_SERVICE_PORT", "50051")
        target = f"{target_host}:{target_port}"
        self.channel = grpc.insecure_channel(target)
        self.stub = auth_pb2_grpc.AuthServiceStub(self.channel)

    def validate_token(self, token: str) -> auth_pb2.ValidateTokenResponse:
        request = auth_pb2.ValidateTokenRequest(token=token)
        return self.stub.ValidateToken(request)

    def get_user_by_id(self, user_id: int) -> auth_pb2.GetUserByIdResponse:
        request = auth_pb2.GetUserByIdRequest(user_id=user_id)
        return self.stub.GetUserById(request)