[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest login)
    {
        if (string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
            return BadRequest(new { message = "Email and password are required" });

        var (success, error, employee, isAdmin) = await _authService.ValidateCredentialsAsync(login.Email, login.Password);
        if (!success || employee == null)
            return Unauthorized(new { message = error });

        HttpContext.Session.SetString("UserId", employee.UserId.ToString());
        HttpContext.Session.SetString("UserEmail", employee.Email);
        HttpContext.Session.SetString("UserRole", isAdmin ? "Admin" : employee.Role);

        return Ok(new
        {
            message = "Login successful",
            userId = employee.UserId,
            email = employee.Email,
            role = isAdmin ? "Admin" : employee.Role
        });
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        var userIdStr = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized(new { message = "No active session" });

        return Ok(new
        {
            userId = userIdStr,
            email = HttpContext.Session.GetString("UserEmail"),
            role = HttpContext.Session.GetString("UserRole")
        });
    }
}
