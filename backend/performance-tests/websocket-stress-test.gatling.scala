import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.core.structure.ScenarioBuilder
import scala.concurrent.duration._

/**
 * Gatling stress test for WebSocket messaging
 * Tests WebSocket scalability with concurrent connections
 */
class WebSocketStressTest extends Simulation {
  
  val httpProtocol = http
    .baseUrl("http://localhost:8080")
    .acceptHeader("application/json")
    .authorizationHeader("Bearer ${token}")
  
  val wsProtocol = ws
    .baseUrl("ws://localhost:8080")
    .reconnect
    .maxReconnects(3)
  
  // Scenario: Connect WebSocket and send messages
  val scn: ScenarioBuilder = scenario("WebSocket Stress Test")
    .exec(http("Login")
      .post("/api/v1/auth/login")
      .body(StringBody("""{"email":"test@example.com","password":"password"}"""))
      .asJson
      .check(jsonPath("$.accessToken").saveAs("token")))
    .pause(1)
    .exec(ws("Connect WebSocket")
      .connect("/ws")
      .onConnected(
        exec(ws("Subscribe to messages")
          .sendText("""{"destination":"/user/queue/messages"}""")
          .await(30 seconds)(
            ws.checkTextMessage("message")
              .check(regex(".*").saveAs("message"))
          )
        )
        .exec(ws("Send message")
          .sendText("""{"destination":"/app/chat.send","body":"{\"conversationId\":\"test\",\"content\":\"Hello\"}"}""")
        )
      )
    )
    .pause(5)
    .exec(ws("Close connection").close)
  
  setUp(
    scn.inject(
      rampUsers(500) during (60 seconds), // 500 concurrent users over 60 seconds
      constantUsersPerSec(10) during (300 seconds) // Maintain 10 users/sec for 5 minutes
    )
  ).protocols(wsProtocol)
    .assertions(
      global.responseTime.max.lt(1000), // Max response time < 1 second
      global.successfulRequests.percent.gt(95) // 95% success rate
    )
}

