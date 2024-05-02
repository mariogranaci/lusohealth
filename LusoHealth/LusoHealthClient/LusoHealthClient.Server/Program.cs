using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using LusoHealthClient.Server.Services;
using LusoHealthClient.Server.Data;
using LusoHealthClient.Server.Models.Users;
using Stripe;
using LusoHealthClient.Server.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//builder.Services.AddSignalR().AddAzureSignalR("Endpoint=https://lusohealth.service.signalr.net;AccessKey=PIeBG1eCMojxiAtcrWvBN3UF34b6lawADCyH1MWSEO0=;Version=1.0;");
builder.Services.AddSignalR();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<JWTService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<ContextSeedService>();

builder.Services.AddIdentityCore<User>(options =>
{
    //configurações email
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;

    //para confirmar email
    options.SignIn.RequireConfirmedEmail = true;

    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
    .AddRoles<IdentityRole>() //para adicionar roles
    .AddRoleManager<RoleManager<IdentityRole>>() //usar o RoleManager
    .AddEntityFrameworkStores<ApplicationDbContext>() //usar o nosso context
    .AddSignInManager<SignInManager<User>>() //usar o SignInManager
    .AddUserManager<UserManager<User>>() //usar o UserManager
    .AddDefaultTokenProviders(); //Usado para criar os tokens de confirmação de email

//Permite fazer a autenticação usando os JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            //validar o token baseado na key dada no development.json JWT:Key
            ValidateIssuerSigningKey = true,
            //o issuer signing key baseada na JWT:Key
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),
            //o issuer é o link do projeto api 
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidateIssuer = true,
            ValidateAudience = false,
        };
    });

StripeConfiguration.ApiKey = builder.Configuration["StripeSettings:PrivateKey"];

builder.Services.AddCors();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = actionContext =>
    {
        var errors = actionContext.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .SelectMany(kvp => kvp.Value.Errors.Select(error => new
            {
                Message = error.ErrorMessage,
                Field = kvp.Key
            }))
            .ToArray();

        var toReturn = new
        {
            Errors = errors
        };

        return new BadRequestObjectResult(toReturn);
    };

});

/*builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});*/

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", build =>
        build.WithOrigins(builder.Configuration["JWT:ClientUrl"], builder.Configuration["JWT:Issuer"])
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials()
               .SetIsOriginAllowed((host) => true));
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ManagerPolicy", policy => policy.RequireRole("Manager"));
    options.AddPolicy("PatientPolicy", policy => policy.RequireRole("Patient"));
    options.AddPolicy("ProfessionalPolicy", policy => policy.RequireRole("Professional"));
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowSpecificOrigins");

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints
    (endpoints =>
    {
        _ = endpoints.MapHub<ChatHub>("/chathub");
    });

//app.UseRouting();

app.MapControllers();

app.MapFallbackToFile("/index.html");

//app.MapHub<ChatHub>("/chathub");



#region ContextSeed
using var scope = app.Services.CreateScope();
try
{
    var contextSeedService = scope.ServiceProvider.GetService<ContextSeedService>();
    if (app.Environment.IsDevelopment())
    {
        Console.WriteLine("\n\n\n\n\n\n\n\n\nDEVELOPMENT\n\n\n\n\n\n\n\n\n\n");
        Console.WriteLine(builder.Configuration.GetConnectionString("DefaultConnection"));
        await contextSeedService.InitializeContextAsync();
    }
    else if (app.Environment.IsProduction())
    {
        //await contextSeedService.InitializeProductionAsync();
        await contextSeedService.InitializeContextAsync();
    }

}
catch (Exception ex)
{
    var logger = scope.ServiceProvider.GetService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred while seeding the database.");
}
#endregion

app.Run();
