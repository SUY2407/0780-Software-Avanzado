package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type FXHandler struct {
	service *FXService
}

func NewFXHandler(s *FXService) *FXHandler {
	return &FXHandler{s}
}

func (h *FXHandler) GetRate(c *gin.Context) {

	to := c.DefaultQuery("to", "MXN")

	rate, source, err := h.service.GetRate(to)

	if err != nil && source == "UNAVAILABLE" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "FX service unavailable",
		})
		return
	}

	response := gin.H{
		"base":   "USD",
		"to":     to,
		"rate":   rate,
		"source": source,
	}

	if source != "LIVE" {
		response["warning"] = "Using cached FX rate"
	}

	c.JSON(http.StatusOK, response)
}
