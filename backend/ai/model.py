import torch
import torch.nn as nn
import torch.nn.functional as F
import os

class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)

class UNetOilSpill(nn.Module):
    """
    Modular U-Net Architecture for SAR Satellite Image Oil Spill Segmentation.
    Accepts 1-channel (SAR Backscatter VV/VH) or 3-channel (RGB/Optical/SAR composites).
    Outputs 1-channel binary segmentation mask for dark ocean slick regions.
    """
    def __init__(self, in_channels=3, out_channels=1):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels

        self.inc = DoubleConv(in_channels, 32)
        self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(32, 64))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))
        
        self.up1 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.conv1 = DoubleConv(256, 128)
        self.up2 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.conv2 = DoubleConv(128, 64)
        self.up3 = nn.ConvTranspose2d(64, 32, 2, stride=2)
        self.conv3 = DoubleConv(64, 32)
        
        self.outc = nn.Conv2d(32, out_channels, 1)

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)

        x = self.up1(x4)
        x = torch.cat([x, x3], dim=1)
        x = self.conv1(x)

        x = self.up2(x)
        x = torch.cat([x, x2], dim=1)
        x = self.conv2(x)

        x = self.up3(x)
        x = torch.cat([x, x1], dim=1)
        x = self.conv3(x)

        logits = self.outc(x)
        return torch.sigmoid(logits)

def get_model(weights_path=None, device="cpu"):
    model = UNetOilSpill(in_channels=3, out_channels=1)
    if weights_path and os.path.exists(weights_path):
        try:
            state = torch.load(weights_path, map_location=device)
            model.load_state_dict(state)
            model.eval()
            return model, True
        except Exception as e:
            print(f"Warning loading model weights: {e}")
    model.eval()
    return model, False
