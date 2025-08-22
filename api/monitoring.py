from fastapi import FastAPI, HTTPException
from typing import List, Dict
from services.health_check import HealthCheck
from services.load_balancer import StyleTransferLoadBalancer

monitoring_router = FastAPI()
health_checker = HealthCheck()
load_balancer = StyleTransferLoadBalancer()

@monitoring_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@monitoring_router.get("/nodes/health")
async def nodes_health():
    try:
        health_status = await health_checker.check_all_nodes()
        return {
            "nodes": health_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@monitoring_router.get("/load-balancer/stats")
async def load_balancer_stats():
    return {
        "healthy_nodes_count": len(load_balancer.healthy_nodes),
        "total_nodes": len(load_balancer.nodes),
        "current_node_index": load_balancer.current_node_index,
        "timestamp": datetime.utcnow().isoformat()
    }